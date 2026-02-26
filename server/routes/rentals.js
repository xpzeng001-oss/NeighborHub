const router = require('express').Router();
const rentalController = require('../controllers/rentalController');
const { auth } = require('../middleware/auth');

router.get('/', rentalController.list);
router.post('/', auth, rentalController.create);

module.exports = router;
