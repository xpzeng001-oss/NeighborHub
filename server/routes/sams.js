const router = require('express').Router();
const samController = require('../controllers/samController');
const { auth, optionalAuth } = require('../middleware/auth');
const contentCheck = require('../middleware/contentCheck');

router.get('/', samController.list);
router.get('/:id', optionalAuth, samController.detail);
router.post('/', auth, contentCheck, samController.create);
router.delete('/:id', auth, samController.remove);
router.post('/:id/join', auth, samController.join);
router.put('/:id/shopping-list', auth, samController.updateShoppingList);
router.post('/:id/updates', auth, samController.postUpdate);
router.put('/:id/participants/:userId/pickup', auth, samController.updatePickupStatus);

module.exports = router;
