const router = require('express').Router();
const carpoolController = require('../controllers/carpoolController');
const { auth } = require('../middleware/auth');

router.get('/', carpoolController.list);
router.post('/', auth, carpoolController.create);
router.post('/:id/join', auth, carpoolController.join);

module.exports = router;
