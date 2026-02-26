const { Banner } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({
      where: { is_active: true },
      order: [['sort', 'ASC']],
      attributes: ['id', 'image', 'title', 'link']
    });

    res.json({ code: 0, data: { list: banners } });
  } catch (err) {
    next(err);
  }
};
