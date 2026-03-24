const router = require('express').Router();
const communityController = require('../controllers/communityController');
const { auth } = require('../middleware/auth');

router.get('/districts', communityController.listDistricts);
router.get('/', communityController.list);
router.post('/apply', auth, communityController.apply);
router.get('/my-applications', auth, communityController.myApplications);

module.exports = router;
