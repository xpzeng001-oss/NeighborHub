const contentCheckService = require('../services/contentCheckService');

/**
 * 获取客户端真实 IP
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.connection?.remoteAddress
    || '127.0.0.1';
}

/**
 * 内容安全检查中间件
 * 1. 检测用户安全等级（风控）
 * 2. 检测文本内容安全
 */
function contentCheck(req, res, next) {
  const openid = req.user && req.user.openid;
  if (!openid) {
    return next();
  }

  const textFields = ['title', 'content', 'description', 'petName', 'reward', 'from', 'to'];
  const texts = textFields
    .map(f => req.body[f])
    .filter(v => typeof v === 'string' && v.trim())
    .join(' ');

  const clientIp = getClientIp(req);

  // 并行执行：用户风控 + 文本检测
  const checks = [
    contentCheckService.getUserRiskRank(openid, clientIp)
  ];
  if (texts) {
    checks.push(contentCheckService.textCheck(openid, texts));
  }

  Promise.all(checks)
    .then(([riskResult, textResult]) => {
      if (!riskResult.safe) {
        return res.status(403).json({ code: 403, message: '当前操作存在风险', data: null });
      }
      if (textResult && !textResult.pass) {
        return res.status(400).json({ code: 400, message: textResult.errMsg, data: null });
      }
      next();
    })
    .catch(() => {
      next();
    });
}

module.exports = contentCheck;
