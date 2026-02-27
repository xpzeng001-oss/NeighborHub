const { Report } = require('../models');

// GET /reports - 我的举报列表
exports.list = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 20 } = req.query;

    const { rows, count } = await Report.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(r => ({
      id: r.id,
      targetType: r.target_type,
      targetId: r.target_id,
      reason: r.reason,
      description: r.description,
      status: r.status,
      createdAt: r.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) { next(err); }
};

// POST /reports - 提交举报
exports.create = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.json({ code: 400, message: '请填写举报信息', data: null });
    }

    const report = await Report.create({
      user_id: req.user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      description: description || ''
    });

    res.json({ code: 0, data: { id: report.id } });
  } catch (err) { next(err); }
};
