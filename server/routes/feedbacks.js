const router = require('express').Router();
const feedbackController = require('../controllers/feedbackController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', auth, feedbackController.list);
router.post('/', optionalAuth, feedbackController.create);

module.exports = router;