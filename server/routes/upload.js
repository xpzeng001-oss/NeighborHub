const router = require('express').Router();
const uploadController = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');

router.post('/', auth, uploadController.uploadMiddleware, uploadController.upload);

module.exports = router;
