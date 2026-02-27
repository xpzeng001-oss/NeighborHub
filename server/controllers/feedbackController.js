const { Feedback, User } = require('../models');

// GET /feedbacks - 查看所有反馈（管理用）
exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    const { rows, count } = await Feedback.findAndCountAll({
      include: [{ model: User, attributes: ['nick_name', 'avatar_url'] }],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(r => ({
      id: r.id,
      type: r.type,
      content: r.content,
      contact: r.contact,
      userName: r.User ? r.User.nick_name : '匿名',
      createdAt: r.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) { next(err); }
};

// POST /feedbacks - 提交反馈
exports.create = async (req, res, next) => {
  try {
    const { type, content, contact } = req.body;
    if (!type || !content) {
      return res.json({ code: 400, message: '请填写反馈内容', data: null });
    }

    const feedback = await Feedback.create({
      user_id: req.user ? req.user.id : null,
      type,
      content,
      contact: contact || ''
    });

    res.json({ code: 0, data: { id: feedback.id } });
  } catch (err) { next(err); }
};