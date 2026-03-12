const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/admin');
const admin = require('../controllers/adminController');

// All admin routes require auth + adminAuth
router.use(auth, adminAuth);

// Dashboard stats
router.get('/stats', admin.stats);

// Report management
router.get('/reports',     admin.listReports);
router.put('/reports/:id', admin.handleReport);

// Content moderation
router.get('/content',                      admin.listContent);
router.put('/content/:type/:id/takedown',   admin.takedownContent);
router.put('/content/:type/:id/restore',    admin.restoreContent);

// User management
router.get('/users',                  admin.listUsers);
router.put('/users/:id/ban',          admin.banUser);
router.put('/users/:id/unban',        admin.unbanUser);
router.get('/users/:id/violations',   admin.userViolations);

module.exports = router;
