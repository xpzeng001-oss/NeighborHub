const { Op } = require('sequelize');
const {
  sequelize,
  District,
  User,
  Product,
  Post,
  Comment,
  HelpRequest,
  PetPost,
  SamOrder,
  Carpool,
  Report,
  Violation,
  Community,
  CommunityApplication
} = require('../models');

// ── helper: map target_type string to Sequelize model ──
const MODEL_MAP = {
  product: Product,
  post:    Post,
  comment: Comment,
  pet:     PetPost,
  sam:     SamOrder,
  carpool: Carpool,
  help:    HelpRequest
};

// Default active status for each model (used when restoring)
const DEFAULT_STATUS = {
  product: 'selling',
  post:    'active',
  comment: null,       // Comment has no status field
  pet:     'open',
  sam:     'open',
  carpool: 'open',
  help:    'open'
};

// ── helper: get title / description from a model instance ──
function extractInfo(type, item) {
  const title = item.title || item.pet_name || item.content || '';
  const description = item.description || item.content || '';
  const images = item.images || [];
  const status = item.status || null;
  return { title, description, images, status };
}

// ────────────────────────────────────────────────────────────
// a) GET /admin/stats
// ────────────────────────────────────────────────────────────
exports.stats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingReports, violationsToday, bannedUsers] = await Promise.all([
      Report.count({ where: { status: 'pending' } }),
      Violation.count({ where: { created_at: { [Op.gte]: today } } }),
      User.count({ where: { is_banned: true } })
    ]);

    // Content counts by type
    const contentCounts = {};
    for (const [type, Model] of Object.entries(MODEL_MAP)) {
      contentCounts[type] = await Model.count();
    }

    res.json({
      code: 0,
      data: {
        pendingReports,
        violationsToday,
        bannedUsers,
        contentCounts
      }
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// b) GET /admin/reports
// ────────────────────────────────────────────────────────────
exports.listReports = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, pageSize = 20 } = req.query;
    const where = {};
    if (status !== 'all') where.status = status;

    const { rows, count } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['id', 'nick_name', 'avatar_url'] }
      ],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    // Enrich with target content info
    const list = await Promise.all(rows.map(async (r) => {
      const item = {
        id:          r.id,
        userId:      r.user_id,
        userName:    r.User ? r.User.nick_name : '未知用户',
        userAvatar:  r.User ? r.User.avatar_url : '',
        targetType:  r.target_type,
        targetId:    r.target_id,
        reason:      r.reason,
        description: r.description,
        status:      r.status,
        adminNote:   r.admin_note,
        handledBy:   r.handled_by,
        createdAt:   r.created_at,
        updatedAt:   r.updated_at,
        targetTitle: null,
        targetUserName: null
      };

      // Try to fetch target content info
      const Model = MODEL_MAP[r.target_type];
      if (Model) {
        try {
          const target = await Model.findByPk(r.target_id, {
            include: [{ model: User, attributes: ['id', 'nick_name'] }]
          });
          if (target) {
            const info = extractInfo(r.target_type, target);
            item.targetTitle = info.title;
            item.targetUserName = target.User ? target.User.nick_name : null;
          }
        } catch (_) {
          // ignore – target may have been deleted
        }
      }

      return item;
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// c) PUT /admin/reports/:id
// ────────────────────────────────────────────────────────────
exports.handleReport = async (req, res, next) => {
  try {
    const { action, adminNote, takedown } = req.body;
    if (!['resolve', 'reject'].includes(action)) {
      return res.status(400).json({ code: 400, message: 'action 必须为 resolve 或 reject', data: null });
    }

    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ code: 404, message: '举报记录不存在', data: null });
    }

    // Update report
    report.status = action === 'resolve' ? 'resolved' : 'rejected';
    report.admin_note = adminNote || '';
    report.handled_by = req.user.id;
    await report.save();

    // Takedown logic
    if (takedown && action === 'resolve') {
      const Model = MODEL_MAP[report.target_type];
      if (Model) {
        const target = await Model.findByPk(report.target_id);
        if (target) {
          // Set status='off' if model has status field, otherwise destroy
          if (target.status !== undefined && DEFAULT_STATUS[report.target_type] !== null) {
            target.status = 'off';
            await target.save();
          } else {
            await target.destroy();
          }

          // Create violation for the content author
          await Violation.create({
            user_id:     target.user_id,
            type:        'report_confirmed',
            target_type: report.target_type,
            target_id:   report.target_id,
            reason:      adminNote || report.reason,
            admin_id:    req.user.id
          });

          // Deduct credit score
          await User.decrement('coins', {
            by: 10,
            where: { id: target.user_id }
          });
        }
      }
    }

    res.json({ code: 0, data: { id: report.id, status: report.status } });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// d) GET /admin/content
// ────────────────────────────────────────────────────────────
exports.listContent = async (req, res, next) => {
  try {
    const { type = 'all', status = 'all', page = 1, pageSize = 20, keyword } = req.query;

    const types = type === 'all' ? Object.keys(MODEL_MAP) : [type];
    if (type !== 'all' && !MODEL_MAP[type]) {
      return res.status(400).json({ code: 400, message: '不支持的内容类型', data: null });
    }

    let allItems = [];

    for (const t of types) {
      const Model = MODEL_MAP[t];
      const where = {};

      // Status filter
      if (status !== 'all') {
        if (status === 'off') {
          where.status = 'off';
        } else if (status === 'active') {
          // "active" means anything that is NOT 'off'
          if (DEFAULT_STATUS[t] !== null) {
            where.status = { [Op.ne]: 'off' };
          }
          // For models without status (post, comment), all are active
        }
      }

      // Keyword search
      if (keyword) {
        const likeKeyword = `%${keyword}%`;
        if (Model === Comment) {
          where.content = { [Op.like]: likeKeyword };
        } else {
          where[Op.or] = [
            { title: { [Op.like]: likeKeyword } }
          ];
          if (Model.rawAttributes.description) {
            where[Op.or].push({ description: { [Op.like]: likeKeyword } });
          }
        }
      }

      const items = await Model.findAll({
        where,
        include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url'] }],
        order: [['created_at', 'DESC']]
      });

      items.forEach(item => {
        const info = extractInfo(t, item);
        allItems.push({
          id:          item.id,
          type:        t,
          title:       info.title.substring(0, 100),
          description: (info.description || '').substring(0, 200),
          userName:    item.User ? item.User.nick_name : '未知用户',
          userAvatar:  item.User ? item.User.avatar_url : '',
          images:      info.images,
          status:      info.status,
          createdAt:   item.created_at
        });
      });
    }

    // Sort by createdAt DESC
    allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = allItems.length;
    const offset = (Number(page) - 1) * Number(pageSize);
    const list = allItems.slice(offset, offset + Number(pageSize));

    res.json({ code: 0, data: { list, total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// e) PUT /admin/content/:type/:id/takedown
// ────────────────────────────────────────────────────────────
exports.takedownContent = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;

    const Model = MODEL_MAP[type];
    if (!Model) {
      return res.status(400).json({ code: 400, message: '不支持的内容类型', data: null });
    }

    const item = await Model.findByPk(id);
    if (!item) {
      return res.status(404).json({ code: 404, message: '内容不存在', data: null });
    }

    // Set status='off' if model has status field, otherwise destroy
    if (item.status !== undefined && DEFAULT_STATUS[type] !== null) {
      item.status = 'off';
      await item.save();
    } else {
      await item.destroy();
    }

    // Create violation record
    await Violation.create({
      user_id:     item.user_id,
      type:        'content_violation',
      target_type: type,
      target_id:   Number(id),
      reason:      reason || '内容违规',
      admin_id:    req.user.id
    });

    // Deduct credit score
    await User.decrement('coins', {
      by: 10,
      where: { id: item.user_id }
    });

    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// f) PUT /admin/content/:type/:id/restore
// ────────────────────────────────────────────────────────────
exports.restoreContent = async (req, res, next) => {
  try {
    const { type, id } = req.params;

    const Model = MODEL_MAP[type];
    if (!Model) {
      return res.status(400).json({ code: 400, message: '不支持的内容类型', data: null });
    }

    const defaultStatus = DEFAULT_STATUS[type];
    if (defaultStatus === null) {
      return res.status(400).json({ code: 400, message: '该类型不支持恢复操作', data: null });
    }

    const item = await Model.findByPk(id);
    if (!item) {
      return res.status(404).json({ code: 404, message: '内容不存在', data: null });
    }

    if (item.status !== 'off') {
      return res.status(400).json({ code: 400, message: '该内容未被下架', data: null });
    }

    item.status = defaultStatus;
    await item.save();

    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// g) GET /admin/users
// ────────────────────────────────────────────────────────────
exports.listUsers = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword } = req.query;
    const where = {};
    if (keyword) {
      where.nick_name = { [Op.like]: `%${keyword}%` };
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ['id', 'nick_name', 'avatar_url', 'building', 'coins', 'is_verified', 'role', 'is_banned', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    // Get violation counts for these users
    const userIds = rows.map(u => u.id);
    const violationCounts = await Violation.findAll({
      attributes: [
        'user_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { user_id: { [Op.in]: userIds } },
      group: ['user_id'],
      raw: true
    });

    const countMap = {};
    violationCounts.forEach(v => { countMap[v.user_id] = Number(v.count); });

    const list = rows.map(u => ({
      id:             u.id,
      nickName:       u.nick_name,
      avatarUrl:      u.avatar_url,
      building:       u.building,
      coins:          u.coins,
      isVerified:     u.is_verified,
      role:           u.role,
      isBanned:       u.is_banned,
      violationCount: countMap[u.id] || 0,
      createdAt:      u.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// h) PUT /admin/users/:id/ban
// ────────────────────────────────────────────────────────────
exports.banUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    user.is_banned = true;
    await user.save();

    // Create violation record
    await Violation.create({
      user_id:  user.id,
      type:     'manual',
      reason:   reason || '管理员手动封禁',
      admin_id: req.user.id
    });

    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// i) PUT /admin/users/:id/unban
// ────────────────────────────────────────────────────────────
exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    user.is_banned = false;
    await user.save();

    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// j) GET /admin/community-applications
// ────────────────────────────────────────────────────────────
exports.listCommunityApplications = async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, pageSize = 20 } = req.query;
    const where = {};
    if (status !== 'all') where.status = status;

    const { rows, count } = await CommunityApplication.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url'] }],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(a => ({
      id: a.id,
      userId: a.user_id,
      userName: a.User ? a.User.nick_name : '未知用户',
      userAvatar: a.User ? a.User.avatar_url : '',
      name: a.name,
      address: a.address,
      reason: a.reason,
      contact: a.contact,
      status: a.status,
      adminNote: a.admin_note,
      createdAt: a.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// k) PUT /admin/community-applications/:id
// ────────────────────────────────────────────────────────────
exports.handleCommunityApplication = async (req, res, next) => {
  try {
    const { action, adminNote } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ code: 400, message: 'action 必须为 approve 或 reject', data: null });
    }

    const application = await CommunityApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ code: 404, message: '申请不存在', data: null });
    }
    if (application.status !== 'pending') {
      return res.status(400).json({ code: 400, message: '该申请已处理', data: null });
    }

    application.status = action === 'approve' ? 'approved' : 'rejected';
    application.admin_note = adminNote || '';
    application.handled_by = req.user.id;
    await application.save();

    // If approved, create the community
    if (action === 'approve') {
      await Community.findOrCreate({
        where: { name: application.name },
        defaults: {
          name: application.name,
          address: application.address,
          status: 'active'
        }
      });
    }

    res.json({ code: 0, data: { id: application.id, status: application.status } });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// l) GET /admin/communities
// ────────────────────────────────────────────────────────────
exports.listCommunities = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword } = req.query;
    const where = {};
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }

    const { rows, count } = await Community.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(c => ({
      id: c.id,
      name: c.name,
      address: c.address,
      status: c.status,
      createdAt: c.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// m) POST /admin/communities
// ────────────────────────────────────────────────────────────
exports.createCommunity = async (req, res, next) => {
  try {
    const { name, address } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ code: 400, message: '小区名称不能为空', data: null });
    }

    const existing = await Community.findOne({ where: { name: name.trim() } });
    if (existing) {
      return res.status(400).json({ code: 400, message: '该小区已存在', data: null });
    }

    const community = await Community.create({
      name: name.trim(),
      address: (address || '').trim(),
      status: 'active'
    });

    res.json({ code: 0, data: { id: community.id, name: community.name } });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// n) DELETE /admin/communities/:id
// ────────────────────────────────────────────────────────────
exports.deleteCommunity = async (req, res, next) => {
  try {
    const community = await Community.findByPk(req.params.id);
    if (!community) {
      return res.status(404).json({ code: 404, message: '小区不存在', data: null });
    }

    await community.destroy();
    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// o) GET /admin/users/:id/violations
// ────────────────────────────────────────────────────────────
exports.userViolations = async (req, res, next) => {
  try {
    const violations = await Violation.findAll({
      where: { user_id: req.params.id },
      order: [['created_at', 'DESC']]
    });

    const list = violations.map(v => ({
      id:         v.id,
      userId:     v.user_id,
      type:       v.type,
      targetType: v.target_type,
      targetId:   v.target_id,
      reason:     v.reason,
      adminId:    v.admin_id,
      createdAt:  v.created_at
    }));

    res.json({ code: 0, data: { list } });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// District management
// ────────────────────────────────────────────────────────────
exports.listDistricts = async (req, res, next) => {
  try {
    const districts = await District.findAll({
      include: [{ model: Community, attributes: ['id', 'name', 'status'] }],
      order: [['created_at', 'DESC']]
    });
    const list = districts.map(d => ({
      id: d.id,
      name: d.name,
      status: d.status,
      communityCount: (d.Communities || []).length,
      communities: (d.Communities || []).map(c => ({ id: c.id, name: c.name })),
      createdAt: d.created_at
    }));
    res.json({ code: 0, data: { list } });
  } catch (err) { next(err); }
};

exports.createDistrict = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ code: 400, message: '社区名称不能为空', data: null });
    }
    const existing = await District.findOne({ where: { name: name.trim() } });
    if (existing) {
      return res.status(400).json({ code: 400, message: '该社区已存在', data: null });
    }
    const district = await District.create({ name: name.trim() });
    res.json({ code: 0, data: { id: district.id, name: district.name } });
  } catch (err) { next(err); }
};

exports.deleteDistrict = async (req, res, next) => {
  try {
    const district = await District.findByPk(req.params.id);
    if (!district) return res.status(404).json({ code: 404, message: '社区不存在', data: null });
    await Community.update({ district_id: null }, { where: { district_id: district.id } });
    await district.destroy();
    res.json({ code: 0, data: null });
  } catch (err) { next(err); }
};

exports.assignCommunityToDistrict = async (req, res, next) => {
  try {
    const { districtId } = req.body;
    const community = await Community.findByPk(req.params.id);
    if (!community) return res.status(404).json({ code: 404, message: '小区不存在', data: null });
    if (districtId) {
      const district = await District.findByPk(districtId);
      if (!district) return res.status(404).json({ code: 404, message: '社区不存在', data: null });
    }
    await community.update({ district_id: districtId || null });
    res.json({ code: 0, data: null });
  } catch (err) { next(err); }
};
