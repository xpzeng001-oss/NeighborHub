const router = require('express').Router();
const { Op } = require('sequelize');
const { User, Product, Post, HelpRequest, Rental, PetPost, SamOrder, Carpool, Community, Activity, ServicePost } = require('../models');
const { buildDistrictFilter } = require('../utils/districtFilter');

const topOrder = [['is_top', 'DESC'], ['created_at', 'DESC']];

// GET /api/feed — 广场信息流（混合内容）
router.get('/', async (req, res, next) => {
  try {
    const { type = 'all', page = 1, pageSize = 20, districtId } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);
    const districtWhere = await buildDistrictFilter(districtId);
    const activeWhere = { status: { [Op.ne]: 'off' }, ...districtWhere };

    // 本地服务：合并 pet + sam + service（拼车暂时隐藏）
    if (type === 'local') {
      const perType = offset + limit;
      const [pets, sams, services] = await Promise.all([
        fetchByType('pet', activeWhere, districtWhere, perType, 0),
        fetchByType('sam', activeWhere, districtWhere, perType, 0),
        fetchByType('service', activeWhere, districtWhere, perType, 0)
      ]);
      let all = [...pets.list, ...sams.list, ...services.list];
      all.sort((a, b) => {
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      const list = all.slice(offset, offset + limit);
      return res.json({ code: 0, data: { list, total: all.length, page: Number(page) } });
    }

    // 帖子：合并 post + help
    if (type === 'post') {
      const perType = offset + limit;
      const [posts, helps] = await Promise.all([
        fetchByType('post', activeWhere, districtWhere, perType, 0),
        fetchByType('help', activeWhere, districtWhere, perType, 0)
      ]);
      let all = [...posts.list, ...helps.list];
      all.sort((a, b) => {
        if (a.isTop && !b.isTop) return -1;
        if (!a.isTop && b.isTop) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      const list = all.slice(offset, offset + limit);
      return res.json({ code: 0, data: { list, total: all.length, page: Number(page) } });
    }

    if (type !== 'all') {
      const result = await fetchByType(type, activeWhere, districtWhere, limit, offset);
      return res.json({ code: 0, data: { list: result.list, total: result.total, page: Number(page) } });
    }

    // "全部" — fetch from all types and merge
    const perType = offset + limit;
    const [products, posts, helps, rentals, pets, sams, activities] = await Promise.all([
      fetchByType('product', activeWhere, districtWhere, perType, 0),
      fetchByType('post', activeWhere, districtWhere, perType, 0),
      fetchByType('help', activeWhere, districtWhere, perType, 0),
      fetchByType('rental', activeWhere, districtWhere, perType, 0),
      fetchByType('pet', activeWhere, districtWhere, perType, 0),
      fetchByType('sam', activeWhere, districtWhere, perType, 0),
      // fetchByType('carpool', activeWhere, districtWhere, perType, 0),  // 拼车暂时隐藏
      fetchByType('activity', activeWhere, districtWhere, perType, 0),
      fetchByType('service', activeWhere, districtWhere, perType, 0)
    ]);

    let all = [
      ...products.list, ...posts.list, ...helps.list, ...rentals.list,
      ...pets.list, ...sams.list, ...activities.list, ...services.list
    ];
    // 置顶优先，再按时间
    all.sort((a, b) => {
      if (a.isTop && !b.isTop) return -1;
      if (!a.isTop && b.isTop) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const list = all.slice(offset, offset + limit);

    res.json({ code: 0, data: { list, total: all.length, page: Number(page) } });
  } catch (err) {
    next(err);
  }
});

function mapBase(item, feedType, extra) {
  return {
    feedType, id: item.id, isTop: !!item.is_top,
    userName: item.User ? item.User.nick_name : '',
    userAvatar: item.User ? item.User.avatar_url : '',
    building: item.User ? item.User.building : '',
    community: item.Community ? item.Community.name : '',
    createdAt: item.created_at,
    ...extra
  };
}

async function fetchByType(type, activeWhere, districtWhere, limit, offset) {
  const include = [
    { model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] },
    { model: Community, attributes: ['id', 'name'], required: false }
  ];

  switch (type) {
    case 'product': {
      const { rows, count } = await Product.findAndCountAll({
        where: activeWhere, include, order: topOrder, limit, offset
      });
      return { total: count, list: rows.map(p => mapBase(p, 'product', {
        title: p.title, description: p.description, images: p.images || [],
        price: p.price, isFree: p.is_free
      })) };
    }
    case 'post': {
      const { rows, count } = await Post.findAndCountAll({
        where: activeWhere, include, order: topOrder, limit, offset
      });
      return { total: count, list: rows.map(p => mapBase(p, 'post', {
        title: p.title, description: p.content, images: p.images || [],
        likeCount: p.like_count, commentCount: p.comment_count
      })) };
    }
    case 'help': {
      const { rows, count } = await HelpRequest.findAndCountAll({
        where: activeWhere, include, order: topOrder, limit, offset
      });
      return { total: count, list: rows.map(h => mapBase(h, 'help', {
        title: h.title, description: h.description, images: [],
        isUrgent: h.is_urgent, status: h.status, deadline: h.deadline
      })) };
    }
    case 'rental': {
      const { rows, count } = await Rental.findAndCountAll({
        where: districtWhere, include, order: topOrder, limit, offset
      });
      return { total: count, list: rows.map(r => mapBase(r, 'rental', {
        title: r.title, description: r.description, images: r.images || [],
        rent: r.rent, roomType: r.room_type, area: r.area
      })) };
    }
    case 'pet': {
      const { rows, count } = await PetPost.findAndCountAll({
        where: activeWhere, include, order: topOrder, limit, offset
      });
      return { total: count, list: rows.map(p => mapBase(p, 'pet', {
        title: p.title, description: p.description, images: [],
        petName: p.pet_name, petType: p.pet_type, reward: p.reward, status: p.status
      })) };
    }
    case 'sam': {
      const { rows, count } = await SamOrder.findAndCountAll({
        where: activeWhere, include, order: topOrder, limit, offset
      });
      return { total: count, list: rows.map(s => mapBase(s, 'sam', {
        title: s.title, description: s.description, images: [],
        deadline: s.deadline, targetCount: s.target_count, currentCount: s.current_count, status: s.status
      })) };
    }
    case 'carpool': {
      const { rows, count } = await Carpool.findAndCountAll({
        where: activeWhere, include, order: topOrder, limit, offset
      });
      return { total: count, list: rows.map(c => mapBase(c, 'carpool', {
        title: c.title, description: c.description, images: [],
        from: c.from_location, to: c.to_location, date: c.date, time: c.time,
        seats: c.seats, takenSeats: c.taken_seats, fee: c.fee, status: c.status
      })) };
    }
    case 'activity': {
      const { rows, count } = await Activity.findAndCountAll({
        where: activeWhere, include, order: topOrder, limit, offset
      });
      return { total: count, list: rows.map(a => mapBase(a, 'activity', {
        title: a.title, description: a.description, images: a.images || [],
        coverImage: a.cover_image, startTime: a.start_time, endTime: a.end_time,
        location: a.location, price: a.price,
        maxParticipants: a.max_participants, currentParticipants: a.current_participants,
        participantAvatars: a.participant_avatars, participantIds: a.participant_ids || [],
        status: a.status
      })) };
    }
    case 'service': {
      const { rows, count } = await ServicePost.findAndCountAll({
        where: activeWhere, include, order: topOrder, limit, offset
      });
      return { total: count, list: rows.map(s => mapBase(s, 'service', {
        title: s.title, description: s.description, images: s.images || [],
        serviceType: s.type, status: s.status
      })) };
    }
    default:
      return { total: 0, list: [] };
  }
}

module.exports = router;
