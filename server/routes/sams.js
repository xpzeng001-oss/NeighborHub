const router = require('express').Router();
const samController = require('../controllers/samController');
const { auth } = require('../middleware/auth');

const { optionalAuth } = require('../middleware/auth');

router.get('/', samController.list);
router.get('/:id', optionalAuth, samController.detail);
router.post('/', auth, samController.create);
router.delete('/:id', auth, samController.remove);
router.post('/:id/join', auth, samController.join);
router.put('/:id/shopping-list', auth, samController.updateShoppingList);
router.post('/:id/updates', auth, samController.postUpdate);
router.put('/:id/participants/:userId/pickup', auth, samController.updatePickupStatus);

module.exports = router;
