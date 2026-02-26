const router = require('express').Router();
const helpController = require('../controllers/helpController');
const { auth } = require('../middleware/auth');

router.get('/', helpController.list);
router.post('/', auth, helpController.create);
router.post('/:id/respond', auth, helpController.respond);

module.exports = router;
