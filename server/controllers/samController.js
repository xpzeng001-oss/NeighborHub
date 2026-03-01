const { SamOrder, User } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status, communityId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (communityId) where.community_id = communityId;

    const { rows, count } = await SamOrder.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(o => ({
      id: o.id,
      userId: o.user_id,
      userName: o.User ? o.User.nick_name : '匿名用户',
      userAvatar: o.User ? o.User.avatar_url : '',
      building: o.User ? o.User.building : '',
      title: o.title,
      description: o.description,
      deadline: o.deadline,
      pickupMethod: o.pickup_method,
      minAmount: o.min_amount,
      targetCount: o.target_count,
      currentCount: o.current_count,
      status: o.status,
      createdAt: o.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, deadline, pickupMethod, minAmount, targetCount } = req.body;
    if (!title) {
      return res.status(400).json({ code: 400, message: '标题不能为空', data: null });
    }

    const order = await SamOrder.create({
      user_id: req.user.id,
      title,
      description: description || '',
      deadline: deadline || '',
      pickup_method: pickupMethod || '',
      min_amount: Number(minAmount) || 0,
      target_count: Number(targetCount) || 5
    });

    res.json({ code: 0, data: { id: order.id } });
  } catch (err) {
    next(err);
  }
};

exports.join = async (req, res, next) => {
  try {
    const order = await SamOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ code: 404, message: '拼单不存在', data: null });
    }
    if (order.status !== 'open') {
      return res.status(400).json({ code: 400, message: '拼单已截止', data: null });
    }
    const newCount = order.current_count + 1;
    const newStatus = newCount >= order.target_count ? 'full' : 'open';
    await order.update({ current_count: newCount, status: newStatus });
    res.json({ code: 0, data: { currentCount: newCount, status: newStatus } });
  } catch (err) {
    next(err);
  }
};
