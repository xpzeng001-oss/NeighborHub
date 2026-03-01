const router = require('express').Router();
const petController = require('../controllers/petController');
const { auth } = require('../middleware/auth');

router.get('/', petController.list);
router.post('/', auth, petController.create);
router.post('/:id/respond', auth, petController.respond);

module.exports = router;
