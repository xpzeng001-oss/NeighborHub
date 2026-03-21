const router = require('express').Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/avatar-config', authController.getAvatarConfig);

module.exports = router;
