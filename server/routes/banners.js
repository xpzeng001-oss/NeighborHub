const router = require('express').Router();
const bannerController = require('../controllers/bannerController');

router.get('/', bannerController.list);

module.exports = router;
