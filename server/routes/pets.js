const router = require('express').Router();
const petController = require('../controllers/petController');
const { auth } = require('../middleware/auth');

router.get('/', petController.list);
router.get('/:id', petController.detail);
router.post('/', auth, petController.create);
router.delete('/:id', auth, petController.remove);
router.post('/:id/respond', auth, petController.respond);

module.exports = router;
