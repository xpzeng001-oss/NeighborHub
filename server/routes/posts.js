const router = require('express').Router();
const postController = require('../controllers/postController');
const { auth } = require('../middleware/auth');

router.get('/', postController.list);
router.get('/:id', postController.detail);
router.post('/', auth, postController.create);
router.delete('/:id', auth, postController.remove);
router.post('/:id/like', auth, postController.like);
router.post('/:id/comment', auth, postController.addComment);

module.exports = router;
