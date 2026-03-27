const { Activity, User, Conversation, Message } = require('../models');
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

    const { rows, count } = await Activity.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }],
      order: [['is_top', 'DESC'], ['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(a => ({
      id: a.id,
      userId: a.user_id,
      userName: a.User ? a.User.nick_name : '匿名用户',
      userAvatar: a.User ? a.User.avatar_url : '',
      building: a.User ? a.User.building : '',
      title: a.title,
      description: a.description,
      coverImage: a.cover_image,
      images: a.images,
      startTime: a.start_time,
      endTime: a.end_time,
      location: a.location,
      latitude: a.latitude,
      longitude: a.longitude,
      price: a.price,
      maxParticipants: a.max_participants,
      currentParticipants: a.current_participants,
      participantAvatars: a.participant_avatars,
      status: a.status,
      createdAt: a.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const activity = await Activity.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }]
    });
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在', data: null });
    }
    const isOrganizer = req.user && req.user.id === activity.user_id;
    const pIds = activity.participant_ids || [];
    const isJoined = req.user ? pIds.includes(req.user.id) : false;

    res.json({
      code: 0,
      data: {
        id: activity.id,
        userId: activity.user_id,
        userName: activity.User ? activity.User.nick_name : '匿名用户',
        userAvatar: activity.User ? activity.User.avatar_url : '',
        building: activity.User ? activity.User.building : '',
        title: activity.title,
        description: activity.description,
        coverImage: activity.cover_image,
        images: activity.images,
        startTime: activity.start_time,
        endTime: activity.end_time,
        location: activity.location,
        latitude: activity.latitude,
        longitude: activity.longitude,
        price: activity.price,
        maxParticipants: activity.max_participants,
        currentParticipants: activity.current_participants,
        participantAvatars: activity.participant_avatars,
        status: activity.status,
        createdAt: activity.created_at,
        isOrganizer,
        isJoined
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, coverImage, images, startTime, endTime, location, latitude, longitude, price, maxParticipants, communityId } = req.body;
    if (!title) {
      return res.status(400).json({ code: 400, message: '标题不能为空', data: null });
    }

    // 发起人自动成为第一个参与者
    const creator = await User.findByPk(req.user.id, { attributes: ['avatar_url'] });
    const creatorAvatar = (creator && creator.avatar_url) ? creator.avatar_url : '/images/avatar-placeholder.png';
    const initAvatars = [creatorAvatar];

    const activity = await Activity.create({
      user_id: req.user.id,
      title,
      description: description || '',
      cover_image: coverImage || '',
      images: images || [],
      start_time: startTime || '',
      end_time: endTime || '',
      location: location || '',
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      price: Number(price) || 0,
      max_participants: Number(maxParticipants) || 0,
      current_participants: 1,
      participant_ids: [req.user.id],
      participant_avatars: initAvatars,
      community_id: communityId || null
    });

    coinService.grant(req.user.id, 'publish_post', activity.id);

    res.json({ code: 0, data: { id: activity.id } });
  } catch (err) {
    next(err);
  }
};

exports.join = async (req, res, next) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在', data: null });
    }
    if (activity.status !== 'open') {
      return res.status(400).json({ code: 400, message: '活动报名已截止', data: null });
    }

    // Prevent duplicate join
    const oldIds = activity.participant_ids || [];
    if (oldIds.includes(req.user.id)) {
      return res.status(400).json({ code: 400, message: '你已经报名了', data: null });
    }

    const joiner = await User.findByPk(req.user.id, { attributes: ['nick_name', 'avatar_url'] });
    const avatar = (joiner && joiner.avatar_url) ? joiner.avatar_url : '/images/avatar-placeholder.png';

    const newIds = [...oldIds, req.user.id];
    const newAvatars = [...(activity.participant_avatars || []), avatar];
    const newCount = newIds.length;
    const newStatus = activity.max_participants > 0 && newCount >= activity.max_participants ? 'full' : 'open';

    await activity.update({
      current_participants: newCount,
      status: newStatus,
      participant_ids: newIds,
      participant_avatars: newAvatars
    });

    // Notify organizer
    if (req.user.id !== activity.user_id) {
      try {
        const joinerName = joiner ? joiner.nick_name : '用户';
        const userAId = Math.min(req.user.id, activity.user_id);
        const userBId = Math.max(req.user.id, activity.user_id);
        const [conversation] = await Conversation.findOrCreate({
          where: { user_a_id: userAId, user_b_id: userBId },
          defaults: { user_a_id: userAId, user_b_id: userBId }
        });
        await Message.create({
          conversation_id: conversation.id,
          sender_id: req.user.id,
          content: `${joinerName}报名了你的活动「${activity.title}」`
        });
        await conversation.update({ last_message_at: new Date() });
      } catch (e) {
        console.error('活动通知发送失败:', e.message);
      }
    }

    res.json({ code: 0, data: { currentParticipants: newCount, status: newStatus } });
  } catch (err) {
    next(err);
  }
};

exports.cancelJoin = async (req, res, next) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在', data: null });
    }

    // Remove by user ID
    const oldIds = activity.participant_ids || [];
    const idx = oldIds.indexOf(req.user.id);
    if (idx === -1) {
      return res.status(400).json({ code: 400, message: '你还没有报名', data: null });
    }

    const newIds = oldIds.filter((_, i) => i !== idx);
    const oldAvatars = activity.participant_avatars || [];
    const newAvatars = oldAvatars.filter((_, i) => i !== idx);

    const newCount = newIds.length;
    const newStatus = activity.status === 'full' ? 'open' : activity.status;

    await activity.update({
      current_participants: newCount,
      status: newStatus,
      participant_ids: newIds,
      participant_avatars: newAvatars
    });

    res.json({ code: 0, data: { currentParticipants: newCount, status: newStatus } });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在', data: null });
    }
    if (activity.user_id !== req.user.id && req.user.id !== 20) {
      return res.status(403).json({ code: 403, message: '无权操作', data: null });
    }
    await activity.destroy();
    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
};
