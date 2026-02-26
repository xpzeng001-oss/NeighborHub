const router = require('express').Router();
const petController = require('../controllers/petController');
const { auth } = require('../middleware/auth');

router.get('/', petController.list);
router.post('/', auth, petController.create);

module.exports = router;
