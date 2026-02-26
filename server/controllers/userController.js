const { User, Product, Favorite } = require('../models');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'nick_name', 'avatar_url', 'building', 'credit_score', 'is_verified', 'created_at']
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
        creditScore: user.credit_score,
        isVerified: user.is_verified,
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

    const allowedFields = ['nick_name', 'avatar_url', 'building', 'is_verified'];
    const updates = {};
    const fieldMap = { nickName: 'nick_name', avatarUrl: 'avatar_url', building: 'building', isVerified: 'is_verified' };

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
        creditScore: user.credit_score,
        isVerified: user.is_verified
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
      Product.count({ where: { user_id: userId, status: ['selling', 'sold'] } }),
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
