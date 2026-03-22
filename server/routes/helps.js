const router = require('express').Router();
const helpController = require('../controllers/helpController');
const { auth } = require('../middleware/auth');
const contentCheck = require('../middleware/contentCheck');

router.get('/', helpController.list);
router.post('/', auth, contentCheck, helpController.create);
router.delete('/:id', auth, helpController.remove);
router.post('/:id/respond', auth, helpController.respond);

module.exports = router;
