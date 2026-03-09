const { Carpool, User, Conversation, Message } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, type, communityId, userId } = req.query;
    const where = {};
    if (type) where.type = type;
    if (communityId) where.community_id = communityId;
    if (userId) where.user_id = Number(userId);

    const { rows, count } = await Carpool.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(c => ({
      id: c.id,
      userId: c.user_id,
      userName: c.User ? c.User.nick_name : '匿名用户',
      userAvatar: c.User ? c.User.avatar_url : '',
      building: c.User ? c.User.building : '',
      type: c.type,
      title: c.title,
      description: c.description,
      from: c.from_location,
      to: c.to_location,
      date: c.date,
      time: c.time,
      seats: c.seats,
      takenSeats: c.taken_seats,
      fee: c.fee,
      status: c.status,
      participants: [],
      createdAt: c.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { type, title, description, from, to, date, time, seats, fee } = req.body;
    if (!title) {
      return res.status(400).json({ code: 400, message: '标题不能为空', data: null });
    }

    const carpool = await Carpool.create({
      user_id: req.user.id,
      type: type || 'offer',
      title,
      description: description || '',
      from_location: from || '',
      to_location: to || '',
      date: date || '',
      time: time || '',
      seats: Number(seats) || 0,
      fee: fee || ''
    });

    res.json({ code: 0, data: { id: carpool.id } });
  } catch (err) {
    next(err);
  }
};

exports.join = async (req, res, next) => {
  try {
    const carpool = await Carpool.findByPk(req.params.id);
    if (!carpool) {
      return res.status(404).json({ code: 404, message: '拼车不存在', data: null });
    }
    if (carpool.status !== 'open') {
      return res.status(400).json({ code: 400, message: '拼车已满座', data: null });
    }
    const newTaken = carpool.taken_seats + 1;
    const newStatus = carpool.seats > 0 && newTaken >= carpool.seats ? 'full' : 'open';
    await carpool.update({ taken_seats: newTaken, status: newStatus });

    // 自动通知车主/发起人
    if (req.user.id !== carpool.user_id) {
      try {
        const joiner = await User.findByPk(req.user.id, { attributes: ['nick_name'] });
        const joinerName = joiner ? joiner.nick_name : '用户';
        const userAId = Math.min(req.user.id, carpool.user_id);
        const userBId = Math.max(req.user.id, carpool.user_id);
        const [conversation] = await Conversation.findOrCreate({
          where: { user_a_id: userAId, user_b_id: userBId },
          defaults: { user_a_id: userAId, user_b_id: userBId }
        });
        await Message.create({
          conversation_id: conversation.id,
          sender_id: req.user.id,
          content: `${joinerName}加入了你的拼车「${carpool.title}」`
        });
        await conversation.update({ last_message_at: new Date() });
      } catch (e) {
        console.error('拼车通知发送失败:', e.message);
      }
    }

    res.json({ code: 0, data: { takenSeats: newTaken, status: newStatus } });
  } catch (err) {
    next(err);
  }
};
