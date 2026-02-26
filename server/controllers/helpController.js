const { HelpRequest, User } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, communityId } = req.query;
    const where = {};
    if (communityId) where.community_id = communityId;

    const { rows, count } = await HelpRequest.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url'] }],
      order: [['is_urgent', 'DESC'], ['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(h => ({
      id: h.id,
      userId: h.user_id,
      userName: h.User.nick_name,
      userAvatar: h.User.avatar_url,
      building: h.building,
      title: h.title,
      description: h.description,
      isUrgent: h.is_urgent,
      status: h.status,
      deadline: h.deadline,
      createdAt: h.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, isUrgent, deadline, building } = req.body;
    if (!title) {
      return res.status(400).json({ code: 400, message: '标题不能为空', data: null });
    }

    const help = await HelpRequest.create({
      user_id: req.user.id,
      building: building || '',
      title,
      description: description || '',
      is_urgent: !!isUrgent,
      deadline: deadline || null
    });

    res.json({ code: 0, data: { id: help.id } });
  } catch (err) {
    next(err);
  }
};

exports.respond = async (req, res, next) => {
  try {
    const help = await HelpRequest.findByPk(req.params.id);
    if (!help) {
      return res.status(404).json({ code: 404, message: '求助不存在', data: null });
    }
    await help.update({ status: 'fulfilled' });
    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
};
