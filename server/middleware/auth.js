const tokenService = require('../services/tokenService');

// 必须登录
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录', data: null });
  }

  const token = header.slice(7);
  try {
    const payload = tokenService.verify(token);
    req.user = { id: payload.id, openid: payload.openid };
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'token已过期', data: null });
  }
}

// 可选登录（不报错，有 token 就解析）
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
