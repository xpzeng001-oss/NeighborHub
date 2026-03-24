const { Rental, User } = require('../models');
const { buildDistrictFilter } = require('../utils/districtFilter');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, communityId, districtId } = req.query;
    const where = {};
    if (communityId) where.community_id = communityId;
    else Object.assign(where, await buildDistrictFilter(districtId));

    const { rows, count } = await Rental.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url'] }],
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: r.User ? r.User.nick_name : '匿名用户',
      building: r.building,
      title: r.title,
      roomType: r.room_type,
      area: Number(r.area),
      rent: r.rent,
      deposit: r.deposit,
      isAgent: r.is_agent,
      images: r.images || [],
      description: r.description,
      createdAt: r.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, building, roomType, area, rent, deposit, isAgent, images, description, communityId } = req.body;
    if (!title) {
      return res.status(400).json({ code: 400, message: '标题不能为空', data: null });
    }

    const rental = await Rental.create({
      user_id: req.user.id,
      building: building || '',
      title,
      room_type: roomType || '',
      area: area || 0,
      rent: rent || 0,
      deposit: deposit || '',
      is_agent: !!isAgent,
      images: images || [],
      description: description || '',
      community_id: communityId || null
    });

    res.json({ code: 0, data: { id: rental.id } });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const rental = await Rental.findByPk(req.params.id);
    if (!rental) return res.status(404).json({ code: 404, message: '租赁不存在', data: null });
    if (rental.user_id !== req.user.id) return res.status(403).json({ code: 403, message: '无权删除', data: null });
    await rental.destroy();
    res.json({ code: 0, data: null });
  } catch (err) { next(err); }
};
