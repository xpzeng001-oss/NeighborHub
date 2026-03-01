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

module.exports = router;
