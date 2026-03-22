const router = require('express').Router();
const carpoolController = require('../controllers/carpoolController');
const { auth } = require('../middleware/auth');
const contentCheck = require('../middleware/contentCheck');

router.get('/', carpoolController.list);
router.post('/', auth, contentCheck, carpoolController.create);
router.delete('/:id', auth, carpoolController.remove);
router.post('/:id/join', auth, carpoolController.join);

module.exports = router;
