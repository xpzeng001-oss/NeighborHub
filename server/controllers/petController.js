const { PetPost, User } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, type, communityId } = req.query;
    const where = {};
    if (type) where.type = type;
    if (communityId) where.community_id = communityId;

    const { rows, count } = await PetPost.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(p => ({
      id: p.id,
      userId: p.user_id,
      userName: p.User ? p.User.nick_name : '匿名用户',
      userAvatar: p.User ? p.User.avatar_url : '',
      building: p.User ? p.User.building : '',
      type: p.type,
      petName: p.pet_name,
      petType: p.pet_type,
      title: p.title,
      description: p.description,
      dateRange: p.date_range,
      reward: p.reward,
      tags: p.tags || [],
      status: p.status,
      responseCount: p.response_count,
      createdAt: p.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { type, petName, petType, title, description, dateRange, reward, tags } = req.body;
    if (!title || !type) {
      return res.status(400).json({ code: 400, message: '标题和类型不能为空', data: null });
    }

    const pet = await PetPost.create({
      user_id: req.user.id,
      type,
      pet_name: petName || '',
      pet_type: petType || '',
      title,
      description: description || '',
      date_range: dateRange || '',
      reward: reward || '',
      tags: tags || []
    });

    res.json({ code: 0, data: { id: pet.id } });
  } catch (err) {
    next(err);
  }
};
