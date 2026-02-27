const router = require('express').Router();
const reportController = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

router.get('/', auth, reportController.list);
router.post('/', auth, reportController.create);

module.exports = router;
