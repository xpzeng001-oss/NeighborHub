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

// Community application management
router.get('/community-applications',      admin.listCommunityApplications);
router.put('/community-applications/:id',  admin.handleCommunityApplication);

// Community management (direct add/delete)
router.get('/communities',         admin.listCommunities);
router.post('/communities',        admin.createCommunity);
router.delete('/communities/:id',  admin.deleteCommunity);

// District management
router.get('/districts',                    admin.listDistricts);
router.post('/districts',                   admin.createDistrict);
router.delete('/districts/:id',             admin.deleteDistrict);
router.put('/communities/:id/district',     admin.assignCommunityToDistrict);

// User management
router.get('/users',                  admin.listUsers);
router.put('/users/:id/ban',          admin.banUser);
router.put('/users/:id/unban',        admin.unbanUser);
router.get('/users/:id/violations',   admin.userViolations);

module.exports = router;
