const tokenService = require('../services/tokenService');

// 必须登录
async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录', data: null });
  }

  const token = header.slice(7);
  try {
    const payload = tokenService.verify(token);
    req.user = { id: payload.id, openid: payload.openid };

    // Check if user is banned (lazy-require to avoid circular dependency)
    const { User } = require('../models');
    const userRecord = await User.findByPk(payload.id, { attributes: ['id', 'is_banned'] });
    if (userRecord && userRecord.is_banned) {
      return res.status(403).json({ code: 403, message: '账号已被封禁，如有疑问请联系管理员', data: null });
    }

    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'token已过期', data: null });
  }
}

// 可选登录（不报错，有 token 就解析；不阻止封禁用户的读操作）
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = tokenService.verify(header.slice(7));
      req.user = { id: payload.id, openid: payload.openid };
    } catch (err) {
      // ignore invalid token
    }
  }
  next();
}

module.exports = { auth, optionalAuth };
