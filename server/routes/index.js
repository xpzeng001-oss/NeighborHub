const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/products', require('./products'));
router.use('/posts', require('./posts'));
router.use('/helps', require('./helps'));
router.use('/rentals', require('./rentals'));
router.use('/pets', require('./pets'));
router.use('/upload', require('./upload'));
router.use('/users', require('./users'));
router.use('/banners', require('./banners'));

module.exports = router;
