const router = require('express').Router();
const { Op } = require('sequelize');
const { User, Product, Post, HelpRequest, Rental, PetPost, SamOrder, Carpool } = require('../models');
const { buildDistrictFilter } = require('../utils/districtFilter');

// GET /api/feed — 广场信息流（混合内容）
router.get('/', async (req, res, next) => {
  try {
    const { type = 'all', page = 1, pageSize = 20, districtId } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);
    const districtWhere = await buildDistrictFilter(districtId);
    const activeWhere = { status: { [Op.ne]: 'off' }, ...districtWhere };

    // If specific type, fetch from that table only
    if (type !== 'all') {
      const result = await fetchByType(type, activeWhere, districtWhere, limit, offset);
      return res.json({ code: 0, data: { list: result.list, total: result.total, page: Number(page) } });
    }

    // "全部" — fetch recent items from all types and merge
    const perType = Math.ceil(limit / 7) + 2; // fetch a bit more per type
    const [products, posts, helps, rentals, pets, sams, carpools] = await Promise.all([
      fetchByType('product', activeWhere, districtWhere, perType, 0),
      fetchByType('post', activeWhere, districtWhere, perType, 0),
      fetchByType('help', activeWhere, districtWhere, perType, 0),
      fetchByType('rental', activeWhere, districtWhere, perType, 0),
      fetchByType('pet', activeWhere, districtWhere, perType, 0),
      fetchByType('sam', activeWhere, districtWhere, perType, 0),
      fetchByType('carpool', activeWhere, districtWhere, perType, 0)
    ]);

    let all = [
      ...products.list, ...posts.list, ...helps.list, ...rentals.list,
      ...pets.list, ...sams.list, ...carpools.list
    ];
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const list = all.slice(offset, offset + limit);
    const total = all.length;

    res.json({ code: 0, data: { list, total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
});

async function fetchByType(type, activeWhere, districtWhere, limit, offset) {
  const include = [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }];

  switch (type) {
    case 'product': {
      const { rows, count } = await Product.findAndCountAll({
        where: activeWhere, include, order: [['created_at', 'DESC']], limit, offset
      });
      return {
        total: count,
        list: rows.map(p => ({
          feedType: 'product', id: p.id, title: p.title, description: p.description,
          images: p.images || [], price: p.price, isFree: p.is_free,
          userName: p.User ? p.User.nick_name : '', userAvatar: p.User ? p.User.avatar_url : '',
          building: p.User ? p.User.building : '', createdAt: p.created_at
        }))
      };
    }
    case 'post': {
      const { rows, count } = await Post.findAndCountAll({
        where: activeWhere, include, order: [['is_top', 'DESC'], ['created_at', 'DESC']], limit, offset
      });
      return {
        total: count,
        list: rows.map(p => ({
          feedType: 'post', id: p.id, title: p.title, description: p.content,
          images: p.images || [], likeCount: p.like_count, commentCount: p.comment_count, isTop: p.is_top,
          userName: p.User ? p.User.nick_name : '', userAvatar: p.User ? p.User.avatar_url : '',
          building: p.User ? p.User.building : '', createdAt: p.created_at
        }))
      };
    }
    case 'help': {
      const { rows, count } = await HelpRequest.findAndCountAll({
        where: activeWhere, include, order: [['created_at', 'DESC']], limit, offset
      });
      return {
        total: count,
        list: rows.map(h => ({
          feedType: 'help', id: h.id, title: h.title, description: h.description,
          images: [], isUrgent: h.is_urgent, status: h.status, deadline: h.deadline,
          userName: h.User ? h.User.nick_name : '', userAvatar: h.User ? h.User.avatar_url : '',
          building: h.User ? h.User.building : '', createdAt: h.created_at
        }))
      };
    }
    case 'rental': {
      const { rows, count } = await Rental.findAndCountAll({
        where: districtWhere, include, order: [['created_at', 'DESC']], limit, offset
      });
      return {
        total: count,
        list: rows.map(r => ({
          feedType: 'rental', id: r.id, title: r.title, description: r.description,
          images: r.images || [], rent: r.rent, roomType: r.room_type, area: r.area,
          userName: r.User ? r.User.nick_name : '', userAvatar: r.User ? r.User.avatar_url : '',
          building: r.User ? r.User.building : '', createdAt: r.created_at
        }))
      };
    }
    case 'pet': {
      const { rows, count } = await PetPost.findAndCountAll({
        where: activeWhere, include, order: [['created_at', 'DESC']], limit, offset
      });
      return {
        total: count,
        list: rows.map(p => ({
          feedType: 'pet', id: p.id, title: p.title, description: p.description,
          images: [], petName: p.pet_name, petType: p.pet_type, reward: p.reward, status: p.status,
          userName: p.User ? p.User.nick_name : '', userAvatar: p.User ? p.User.avatar_url : '',
          building: p.User ? p.User.building : '', createdAt: p.created_at
        }))
      };
    }
    case 'sam': {
      const { rows, count } = await SamOrder.findAndCountAll({
        where: activeWhere, include, order: [['created_at', 'DESC']], limit, offset
      });
      return {
        total: count,
        list: rows.map(s => ({
          feedType: 'sam', id: s.id, title: s.title, description: s.description,
          images: [], deadline: s.deadline, targetCount: s.target_count, currentCount: s.current_count, status: s.status,
          userName: s.User ? s.User.nick_name : '', userAvatar: s.User ? s.User.avatar_url : '',
          building: s.User ? s.User.building : '', createdAt: s.created_at
        }))
      };
    }
    case 'carpool': {
      const { rows, count } = await Carpool.findAndCountAll({
        where: activeWhere, include, order: [['created_at', 'DESC']], limit, offset
      });
      return {
        total: count,
        list: rows.map(c => ({
          feedType: 'carpool', id: c.id, title: c.title, description: c.description,
          images: [], from: c.from_location, to: c.to_location, date: c.date, time: c.time,
          seats: c.seats, takenSeats: c.taken_seats, fee: c.fee, status: c.status,
          userName: c.User ? c.User.nick_name : '', userAvatar: c.User ? c.User.avatar_url : '',
          building: c.User ? c.User.building : '', createdAt: c.created_at
        }))
      };
    }
    default:
      return { total: 0, list: [] };
  }
}

module.exports = router;
