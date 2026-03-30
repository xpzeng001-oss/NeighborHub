const router = require('express').Router();

router.use('/auth',     require('./auth'));
router.use('/products', require('./products'));
router.use('/posts',    require('./posts'));
router.use('/helps',    require('./helps'));
router.use('/rentals',  require('./rentals'));
router.use('/pets',     require('./pets'));
router.use('/upload',   require('./upload'));
router.use('/users',    require('./users'));
router.use('/banners',  require('./banners'));
router.use('/cos',      require('./cos'));   // COS 临时凭证
router.use('/chat',     require('./chat'));
router.use('/reports',  require('./reports'));
router.use('/feedbacks', require('./feedbacks'));
router.use('/sams',      require('./sams'));
router.use('/carpools',  require('./carpools'));
router.use('/services',  require('./services'));
router.use('/activities', require('./activities'));
router.use('/stats',     require('./stats'));
router.use('/feed',      require('./feed'));
router.use('/wechat',   require('./wechat'));
router.use('/communities', require('./communities'));
router.use('/admin',    require('./admin'));

module.exports = router;
