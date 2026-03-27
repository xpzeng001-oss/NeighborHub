const router = require('express').Router();
const { Op } = require('sequelize');
const { Post, HelpRequest, Rental, PetPost, SamOrder, Carpool, User, Product, Activity } = require('../models');
const { getCommunityIdsForDistrict } = require('../utils/districtFilter');

// GET /api/stats/counts - 各分类数量统计（排除已下架内容，支持按社区过滤）
router.get('/counts', async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 基础过滤条件
    const base = { status: { [Op.ne]: 'off' } };
    const baseRental = {};
    const communityIds = await getCommunityIdsForDistrict(districtId);
    if (communityIds && communityIds.length > 0) {
      base.community_id = { [Op.in]: communityIds };
      baseRental.community_id = { [Op.in]: communityIds };
    }
    const todayBase = { ...base, created_at: { [Op.gte]: today } };

    const [forum, help, rental, pet, sam, carpool, activity, registeredUsers, activePosts, todayPosts] = await Promise.all([
      Post.count({ where: { ...base } }),
      HelpRequest.count({ where: { ...base } }),
      Rental.count({ where: { ...baseRental } }),
      PetPost.count({ where: { ...base } }),
      SamOrder.count({ where: { ...base } }),
      Carpool.count({ where: { ...base } }),
      Activity.count({ where: { ...base } }),
      User.count(),
      // 总帖子数 = 所有未下架内容总数
      Promise.all([
        Post.count({ where: { ...base } }),
        HelpRequest.count({ where: { ...base } }),
        Product.count({ where: { ...base } }),
        PetPost.count({ where: { ...base } }),
        SamOrder.count({ where: { ...base } }),
        Carpool.count({ where: { ...base } }),
        Activity.count({ where: { ...base } })
      ]).then(counts => counts.reduce((a, b) => a + b, 0)),
      // 今日动态 = 今天新发的未下架内容总数
      Promise.all([
        Post.count({ where: { ...todayBase } }),
        HelpRequest.count({ where: { ...todayBase } }),
        Product.count({ where: { ...todayBase } }),
        PetPost.count({ where: { ...todayBase } }),
        SamOrder.count({ where: { ...todayBase } }),
        Carpool.count({ where: { ...todayBase } }),
        Activity.count({ where: { ...todayBase } })
      ]).then(counts => counts.reduce((a, b) => a + b, 0))
    ]);
    res.json({ code: 0, data: { forum, help, rental, pet, sam, carpool, activity, registeredUsers, activePosts, todayPosts } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
