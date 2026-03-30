const { Op } = require('sequelize');
const { User, Product, Favorite, CoinLog } = require('../models');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'nick_name', 'avatar_url', 'building', 'coins', 'is_verified', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    res.json({
      code: 0,
      data: {
        id: user.id,
        nickName: user.nick_name,
        avatarUrl: user.avatar_url,
        building: user.building,
        coins: user.coins,
        isVerified: user.is_verified,
        phone: user.phone,
        wechatId: user.wechat_id,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    if (req.user.id !== Number(req.params.id)) {
      return res.status(403).json({ code: 403, message: '无权操作', data: null });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    const allowedFields = ['nick_name', 'avatar_url', 'building', 'is_verified', 'phone', 'wechat_id'];
    const updates = {};
    const fieldMap = { nickName: 'nick_name', avatarUrl: 'avatar_url', building: 'building', isVerified: 'is_verified', phone: 'phone', wechatId: 'wechat_id' };

    for (const [camel, snake] of Object.entries(fieldMap)) {
      if (req.body[camel] !== undefined) updates[snake] = req.body[camel];
    }

    await user.update(updates);

    res.json({
      code: 0,
      data: {
        id: user.id,
        nickName: user.nick_name,
        avatarUrl: user.avatar_url,
        building: user.building,
        coins: user.coins,
        isVerified: user.is_verified,
        phone: user.phone,
        wechatId: user.wechat_id
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getCoinLogs = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const { rows, count } = await CoinLog.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const ACTION_LABELS = {
      publish_product: '发布闲置',
      publish_post: '发帖',
      daily_login: '每日登录',
      trade_complete: '交易完成',
      invite: '邀请好友'
    };

    res.json({
      code: 0,
      data: {
        list: rows.map(r => ({
          id: r.id,
          action: r.action,
          label: ACTION_LABELS[r.action] || r.action,
          coins: r.coins,
          createdAt: r.created_at
        })),
        total: count
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const [published, favorites, sold] = await Promise.all([
      Product.count({ where: { user_id: userId, status: { [Op.in]: ['selling', 'sold'] } } }),
      Favorite.count({ where: { user_id: userId } }),
      Product.count({ where: { user_id: userId, status: 'sold' } })
    ]);

    res.json({
      code: 0,
      data: { published, favorites, sold, bought: 0 }
    });
  } catch (err) {
    next(err);
  }
};
