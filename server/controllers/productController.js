const { Product, User, Favorite } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, category, isFree, sort, keyword, communityId, userId } = req.query;
    const where = {};
    if (userId) {
      where.user_id = Number(userId);
    } else {
      where.status = 'selling';
    }

    if (category && category !== '全部') where.category = category;
    if (isFree === '1') where.is_free = true;
    if (communityId) where.community_id = communityId;
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    let order;
    switch (sort) {
      case 'hot': order = [['want_count', 'DESC']]; break;
      case 'price_asc': order = [['price', 'ASC']]; break;
      case 'price_desc': order = [['price', 'DESC']]; break;
      default: order = [['created_at', 'DESC']];
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }],
      order,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.map(p => ({
      id: p.id,
      userId: p.user_id,
      userName: p.User.nick_name,
      userAvatar: p.User.avatar_url,
      building: p.User.building,
      title: p.title,
      price: Number(p.price),
      originalPrice: Number(p.original_price),
      isFree: p.is_free,
      category: p.category,
      condition: p.condition,
      status: p.status,
      images: p.images || [],
      description: p.description,
      viewCount: p.view_count,
      wantCount: p.want_count,
      tradeMethod: p.trade_method,
      createdAt: p.created_at
    }));

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }]
    });

    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }

    // 增加浏览量
    await product.increment('view_count');

    // 检查是否已收藏
    let isFavorited = false;
    if (req.user) {
      const fav = await Favorite.findOne({ where: { user_id: req.user.id, product_id: product.id } });
      isFavorited = !!fav;
    }

    res.json({
      code: 0,
      data: {
        id: product.id,
        userId: product.user_id,
        userName: product.User.nick_name,
        userAvatar: product.User.avatar_url,
        building: product.User.building,
        title: product.title,
        price: Number(product.price),
        originalPrice: Number(product.original_price),
        isFree: product.is_free,
        category: product.category,
        condition: product.condition,
        status: product.status,
        images: product.images || [],
        description: product.description,
        viewCount: product.view_count + 1,
        wantCount: product.want_count,
        tradeMethod: product.trade_method,
        createdAt: product.created_at,
        isFavorited
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, price, originalPrice, isFree, category, condition, images, description, tradeMethod } = req.body;

    if (!title) {
      return res.status(400).json({ code: 400, message: '标题不能为空', data: null });
    }

    const product = await Product.create({
      user_id: req.user.id,
      title,
      price: price || 0,
      original_price: originalPrice || 0,
      is_free: !!isFree,
      category: category || '',
      condition: condition || '',
      images: images || [],
      description: description || '',
      trade_method: tradeMethod || ''
    });

    res.json({ code: 0, data: { id: product.id } });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }
    if (product.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权操作', data: null });
    }

    const fields = ['title', 'price', 'original_price', 'is_free', 'category', 'condition', 'images', 'description', 'trade_method', 'status'];
    const updates = {};
    for (const key of fields) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (req.body[camelKey] !== undefined) updates[key] = req.body[camelKey];
    }

    await product.update(updates);
    res.json({ code: 0, data: { id: product.id } });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }
    if (product.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权操作', data: null });
    }

    await product.update({ status: 'off' });
    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
};

exports.want = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在', data: null });
    }
    await product.increment('want_count');
    res.json({ code: 0, data: { wantCount: product.want_count + 1 } });
  } catch (err) {
    next(err);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const existing = await Favorite.findOne({ where: { user_id: userId, product_id: productId } });
    if (existing) {
      await existing.destroy();
      res.json({ code: 0, data: { isFavorited: false } });
    } else {
      await Favorite.create({ user_id: userId, product_id: productId });
      res.json({ code: 0, data: { isFavorited: true } });
    }
  } catch (err) {
    next(err);
  }
};

// GET /favorites - 我的收藏列表
exports.myFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 20 } = req.query;

    const { rows, count } = await Favorite.findAndCountAll({
      where: { user_id: userId },
      include: [{
        model: Product,
        include: [{ model: User, attributes: ['id', 'nick_name', 'avatar_url', 'building'] }]
      }],
      order: [['id', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const list = rows.filter(f => f.Product).map(f => {
      const p = f.Product;
      return {
        id: p.id,
        userId: p.user_id,
        userName: p.User.nick_name,
        userAvatar: p.User.avatar_url,
        title: p.title,
        price: Number(p.price),
        isFree: p.is_free,
        images: p.images || [],
        status: p.status,
        createdAt: p.created_at
      };
    });

    res.json({ code: 0, data: { list, total: count, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};
