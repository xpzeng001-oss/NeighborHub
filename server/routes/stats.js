const router = require('express').Router();
const { Op } = require('sequelize');
const { Post, HelpRequest, Rental, PetPost, SamOrder, Carpool, User, Product } = require('../models');

const notOff = { where: { status: { [Op.ne]: 'off' } } };

// GET /api/stats/counts - 各分类数量统计（排除已下架内容）
router.get('/counts', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayWhere = { created_at: { [Op.gte]: today }, status: { [Op.ne]: 'off' } };

    const [forum, help, rental, pet, sam, carpool, registeredUsers, activePosts, todayPosts] = await Promise.all([
      Post.count(notOff),
      HelpRequest.count(notOff),
      Rental.count(),
      PetPost.count(notOff),
      SamOrder.count(notOff),
      Carpool.count(notOff),
      User.count(),
      // 活跃帖子 = 所有未下架内容总数
      Promise.all([
        Post.count(notOff),
        HelpRequest.count(notOff),
        Product.count({ where: { status: { [Op.ne]: 'off' } } }),
        PetPost.count(notOff),
        SamOrder.count(notOff),
        Carpool.count(notOff)
      ]).then(counts => counts.reduce((a, b) => a + b, 0)),
      // 今日动态 = 今天新发的未下架内容总数
      Promise.all([
        Post.count({ where: todayWhere }),
        HelpRequest.count({ where: todayWhere }),
        Product.count({ where: todayWhere }),
        PetPost.count({ where: todayWhere }),
        SamOrder.count({ where: todayWhere }),
        Carpool.count({ where: todayWhere })
      ]).then(counts => counts.reduce((a, b) => a + b, 0))
    ]);
    res.json({ code: 0, data: { forum, help, rental, pet, sam, carpool, registeredUsers, activePosts, todayPosts } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
