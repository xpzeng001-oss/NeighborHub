const router = require('express').Router();
const productController = require('../controllers/productController');
const { auth, optionalAuth } = require('../middleware/auth');
const contentCheck = require('../middleware/contentCheck');

router.get('/', productController.list);
router.get('/favorites', auth, productController.myFavorites);
router.get('/:id', optionalAuth, productController.detail);
router.post('/', auth, contentCheck, productController.create);
router.put('/:id', auth, contentCheck, productController.update);
router.delete('/:id', auth, productController.remove);
router.put('/:id/relist', auth, productController.relist);
router.post('/:id/want', auth, productController.want);
router.post('/:id/favorite', auth, productController.toggleFavorite);

module.exports = router;
