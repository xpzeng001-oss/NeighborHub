const { PetPost, User } = require('../models');
const contentCheckService = require('../services/contentCheckService');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, type, communityId, userId } = req.query;
    const { Op } = require('sequelize');
    const where = { status: { [Op.ne]: 'off' } };
    if (type) where.type = type;
    if (communityId) where.community_id = communityId;
    if (userId) where.user_id = Number(userId);

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

exports.detail = async (req, res, next) => {
  try {
    const pet = await PetPost.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }]
    });
    if (!pet) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }
    res.json({
      code: 0,
      data: {
        id: pet.id,
        userId: pet.user_id,
        userName: pet.User ? pet.User.nick_name : '匿名用户',
        userAvatar: pet.User ? pet.User.avatar_url : '',
        building: pet.User ? pet.User.building : '',
        type: pet.type,
        petName: pet.pet_name,
        petType: pet.pet_type,
        title: pet.title,
        description: pet.description,
        dateRange: pet.date_range,
        reward: pet.reward,
        tags: pet.tags || [],
        status: pet.status,
        responseCount: pet.response_count,
        createdAt: pet.created_at
      }
    });
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

exports.remove = async (req, res, next) => {
  try {
    const pet = await PetPost.findByPk(req.params.id);
    if (!pet) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }
    if (pet.user_id !== req.user.id && req.user.id !== 20) {
      return res.status(403).json({ code: 403, message: '无权操作', data: null });
    }
    await pet.destroy();
    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
};

exports.respond = async (req, res, next) => {
  try {
    const pet = await PetPost.findByPk(req.params.id);
    if (!pet) {
      return res.status(404).json({ code: 404, message: '帖子不存在', data: null });
    }
    await pet.update({ response_count: pet.response_count + 1 });
    res.json({ code: 0, data: { responseCount: pet.response_count } });
  } catch (err) {
    next(err);
  }
};
