const { User } = require('../models');

async function adminAuth(req, res, next) {
  // req.user must already be set by auth middleware
  if (!req.user) {
    return res.status(401).json({ code: 401, message: '未登录', data: null });
  }
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无管理员权限', data: null });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { adminAuth };
