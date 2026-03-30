const { ServicePost, User, Community } = require('../models');
const { buildDistrictFilter } = require('../utils/districtFilter');
const coinService = require('../services/coinService');
const { Op } = require('sequelize');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, type, districtId } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);
    const districtWhere = await buildDistrictFilter(districtId);
    const where = { status: { [Op.ne]: 'off' }, ...districtWhere };
    if (type) where.type = type;

    const { rows, count } = await ServicePost.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] },
        { model: Community, attributes: ['id', 'name'], required: false }
      ],
      order: [['is_top', 'DESC'], ['created_at', 'DESC']],
      limit, offset
    });

    res.json({ code: 0, data: { list: rows.map(s => ({
      id: s.id, userId: s.user_id,
      userName: s.User ? s.User.nick_name : '', userAvatar: s.User ? s.User.avatar_url : '',
      building: s.User ? s.User.building : '',
      communityName: s.Community ? s.Community.name : '',
      type: s.type, title: s.title, description: s.description, images: s.images || [],
      status: s.status, createdAt: s.created_at,
      contactPhone: s.contact_phone, contactWechat: s.contact_wechat
    })), total: count, page: Number(page) } });
  } catch (err) { next(err); }
};

exports.detail = async (req, res, next) => {
  try {
    const s = await ServicePost.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] },
        { model: Community, attributes: ['id', 'name'], required: false }
      ]
    });
    if (!s) return res.status(404).json({ code: 404, message: '不存在', data: null });
    res.json({ code: 0, data: {
      id: s.id, userId: s.user_id,
      userName: s.User ? s.User.nick_name : '', userAvatar: s.User ? s.User.avatar_url : '',
      building: s.User ? s.User.building : '',
      communityName: s.Community ? s.Community.name : '',
      type: s.type, title: s.title, description: s.description, images: s.images || [],
      status: s.status, createdAt: s.created_at,
      contactPhone: s.contact_phone, contactWechat: s.contact_wechat
    } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { type, title, description, images, communityId, contactPhone, contactWechat } = req.body;
    if (!title || !type) return res.status(400).json({ code: 400, message: '标题和类型不能为空', data: null });
    const s = await ServicePost.create({
      user_id: req.user.id, type, title,
      description: description || '', images: images || [],
      community_id: communityId || null,
      contact_phone: contactPhone || '', contact_wechat: contactWechat || ''
    });
    coinService.grant(req.user.id, 'publish_post', s.id);
    res.json({ code: 0, data: { id: s.id } });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const s = await ServicePost.findByPk(req.params.id);
    if (!s || s.user_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权操作' });
    await s.update({ status: 'off' });
    res.json({ code: 0, data: null });
  } catch (err) { next(err); }
};
