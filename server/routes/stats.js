const router = require('express').Router();
const { Post, HelpRequest, Rental, PetPost, SamOrder, Carpool } = require('../models');

// GET /api/stats/counts - 各分类数量统计
router.get('/counts', async (req, res, next) => {
  try {
    const [forum, help, rental, pet, sam, carpool] = await Promise.all([
      Post.count(),
      HelpRequest.count(),
      Rental.count(),
      PetPost.count(),
      SamOrder.count(),
      Carpool.count()
    ]);
    res.json({ code: 0, data: { forum, help, rental, pet, sam, carpool } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
