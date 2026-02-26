const router = require('express').Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.get('/:id', userController.getProfile);
router.put('/:id', auth, userController.updateProfile);
router.get('/:id/stats', userController.getStats);

module.exports = router;
