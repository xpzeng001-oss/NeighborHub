const { Community, CommunityApplication, User } = require('../models');

// GET /communities — list all active communities
exports.list = async (req, res, next) => {
  try {
    const communities = await Community.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'address'],
      order: [['created_at', 'ASC']]
    });

    const list = communities.map(c => ({
      id: c.id,
      name: c.name,
      address: c.address
    }));

    res.json({ code: 0, data: { list } });
  } catch (err) {
    next(err);
  }
};

// POST /communities/apply — submit community application
exports.apply = async (req, res, next) => {
  try {
    const { name, address, reason, contact } = req.body;
    if (!name) {
      return res.status(400).json({ code: 400, message: '小区名称不能为空', data: null });
    }

    // Check if community already exists
    const existing = await Community.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ code: 400, message: '该小区已存在', data: null });
    }

    // Check if user already has a pending application for same name
    const pendingApp = await CommunityApplication.findOne({
      where: { user_id: req.user.id, name, status: 'pending' }
    });
    if (pendingApp) {
      return res.status(400).json({ code: 400, message: '您已提交过该小区的申请，请耐心等待审核', data: null });
    }

    const application = await CommunityApplication.create({
      user_id: req.user.id,
      name,
      address: address || '',
      reason: reason || '',
      contact: contact || ''
    });

    res.json({ code: 0, data: { id: application.id } });
  } catch (err) {
    next(err);
  }
};

// GET /communities/my-applications — user's own applications
exports.myApplications = async (req, res, next) => {
  try {
    const apps = await CommunityApplication.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    const list = apps.map(a => ({
      id: a.id,
      name: a.name,
      address: a.address,
      reason: a.reason,
      status: a.status,
      adminNote: a.admin_note,
      createdAt: a.created_at
    }));

    res.json({ code: 0, data: { list } });
  } catch (err) {
    next(err);
  }
};
