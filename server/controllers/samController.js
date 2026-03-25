const { SamOrder, User, Conversation, Message } = require('../models');
const { buildDistrictFilter } = require('../utils/districtFilter');
const coinService = require('../services/coinService');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status, communityId, districtId, userId } = req.query;
    const { Op } = require('sequelize');
    const where = { status: { [Op.ne]: 'off' } };
    if (status) where.status = status;
    if (communityId) where.community_id = communityId;
    else Object.assign(where, await buildDistrictFilter(districtId));
    if (userId) where.user_id = Number(userId);

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

exports.detail = async (req, res, next) => {
  try {
    const order = await SamOrder.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }]
    });
    if (!order) {
      return res.status(404).json({ code: 404, message: '拼单不存在', data: null });
    }
    const isOrganizer = req.user && req.user.id === order.user_id;
    res.json({
      code: 0,
      data: {
        id: order.id,
        userId: order.user_id,
        userName: order.User ? order.User.nick_name : '匿名用户',
        userAvatar: order.User ? order.User.avatar_url : '',
        building: order.User ? order.User.building : '',
        title: order.title,
        description: order.description,
        deadline: order.deadline,
        pickupMethod: order.pickup_method,
        minAmount: order.min_amount,
        targetCount: order.target_count,
        currentCount: order.current_count,
        status: order.status,
        createdAt: order.created_at,
        isOrganizer,
        isJoined: false,
        myShoppingList: '',
        participants: [],
        updates: []
      }
    });
  } catch (err) {
    next(err);
  }
};

// 提交/更新采购清单（暂存，后续可扩展数据表）
exports.updateShoppingList = async (req, res, next) => {
  try {
    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
};

// 团长发布进度更新
exports.postUpdate = async (req, res, next) => {
  try {
    const { content, statusTag } = req.body;
    res.json({ code: 0, data: { id: Date.now(), content, statusTag, createdAt: new Date() } });
  } catch (err) {
    next(err);
  }
};

// 团长标记取货状态
exports.updatePickupStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    res.json({ code: 0, data: { status } });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, deadline, pickupMethod, minAmount, targetCount, communityId } = req.body;
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
      target_count: Number(targetCount) || 5,
      community_id: communityId || null
    });

    // 发帖 +3
    coinService.grant(req.user.id, 'publish_post', order.id);

    res.json({ code: 0, data: { id: order.id } });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const order = await SamOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ code: 404, message: '拼单不存在', data: null });
    }
    if (order.user_id !== req.user.id && req.user.id !== 20) {
      return res.status(403).json({ code: 403, message: '无权操作', data: null });
    }
    await order.destroy();
    res.json({ code: 0, data: null });
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

    // 自动通知团长
    if (req.user.id !== order.user_id) {
      try {
        const joiner = await User.findByPk(req.user.id, { attributes: ['nick_name'] });
        const joinerName = joiner ? joiner.nick_name : '用户';
        const userAId = Math.min(req.user.id, order.user_id);
        const userBId = Math.max(req.user.id, order.user_id);
        const [conversation] = await Conversation.findOrCreate({
          where: { user_a_id: userAId, user_b_id: userBId },
          defaults: { user_a_id: userAId, user_b_id: userBId }
        });
        await Message.create({
          conversation_id: conversation.id,
          sender_id: req.user.id,
          content: `${joinerName}加入了你的拼单「${order.title}」`
        });
        await conversation.update({ last_message_at: new Date() });
      } catch (e) {
        console.error('拼单通知发送失败:', e.message);
      }
    }

    res.json({ code: 0, data: { currentCount: newCount, status: newStatus } });
  } catch (err) {
    next(err);
  }
};
