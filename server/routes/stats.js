const router = require('express').Router();
const { Op } = require('sequelize');
const { Post, HelpRequest, Rental, PetPost, SamOrder, Carpool } = require('../models');

const notOff = { where: { status: { [Op.ne]: 'off' } } };

// GET /api/stats/counts - 各分类数量统计（排除已下架内容）
router.get('/counts', async (req, res, next) => {
  try {
    const [forum, help, rental, pet, sam, carpool] = await Promise.all([
      Post.count(notOff),
      HelpRequest.count(notOff),
      Rental.count(),
      PetPost.count(notOff),
      SamOrder.count(notOff),
      Carpool.count(notOff)
    ]);
    res.json({ code: 0, data: { forum, help, rental, pet, sam, carpool } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
