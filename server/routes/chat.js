const router = require('express').Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

router.get('/conversations',              auth, chatController.getConversations);
router.post('/conversations',             auth, chatController.getOrCreateConversation);
router.get('/conversations/:id/messages', auth, chatController.getMessages);
router.post('/conversations/:id/messages',auth, chatController.sendMessage);
router.put('/conversations/:id/read',     auth, chatController.markRead);
router.get('/unread',                     auth, chatController.getUnreadCount);

module.exports = router;
