const router = require('express').Router();
const productController = require('../controllers/productController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', productController.list);
router.get('/:id', optionalAuth, productController.detail);
router.post('/', auth, productController.create);
router.put('/:id', auth, productController.update);
router.delete('/:id', auth, productController.remove);
router.post('/:id/want', auth, productController.want);
router.post('/:id/favorite', auth, productController.toggleFavorite);

module.exports = router;
