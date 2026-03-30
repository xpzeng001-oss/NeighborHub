const router = require('express').Router();
const serviceController = require('../controllers/serviceController');
const { auth } = require('../middleware/auth');
const contentCheck = require('../middleware/contentCheck');

router.get('/', serviceController.list);
router.get('/:id', serviceController.detail);
router.post('/', auth, contentCheck, serviceController.create);
router.delete('/:id', auth, serviceController.remove);

module.exports = router;
