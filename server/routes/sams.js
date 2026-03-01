const router = require('express').Router();
const samController = require('../controllers/samController');
const { auth } = require('../middleware/auth');

router.get('/', samController.list);
router.post('/', auth, samController.create);
router.post('/:id/join', auth, samController.join);

module.exports = router;
