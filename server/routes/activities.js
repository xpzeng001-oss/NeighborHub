const router = require('express').Router();
const activityController = require('../controllers/activityController');
const { auth, optionalAuth } = require('../middleware/auth');
const contentCheck = require('../middleware/contentCheck');

router.get('/', activityController.list);
router.get('/:id', optionalAuth, activityController.detail);
router.post('/', auth, contentCheck, activityController.create);
router.delete('/:id', auth, activityController.remove);
router.post('/:id/join', auth, activityController.join);
router.post('/:id/cancel', auth, activityController.cancelJoin);
router.put('/:id', auth, activityController.update);

module.exports = router;
