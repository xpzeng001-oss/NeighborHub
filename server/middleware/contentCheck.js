const contentCheckService = require('../services/contentCheckService');

/**
 * 内容安全检查中间件
 * 自动提取 req.body 中的文本字段进行微信内容安全检测
 */
function contentCheck(req, res, next) {
  const textFields = ['title', 'content', 'description', 'petName', 'reward', 'from', 'to'];
  const texts = textFields
    .map(f => req.body[f])
    .filter(v => typeof v === 'string' && v.trim())
    .join(' ');

  if (!texts) {
    return next();
  }

  const openid = req.user && req.user.openid;
  if (!openid) {
    return next();
  }

  contentCheckService.textCheck(openid, texts)
    .then(result => {
      if (!result.pass) {
        return res.status(400).json({ code: 400, message: result.errMsg, data: null });
      }
      next();
    })
    .catch(() => {
      // 检测异常时放行
      next();
    });
}

module.exports = contentCheck;
