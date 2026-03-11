const router = require('express').Router();
const crypto = require('crypto');
const { MediaCheck, Product, Post, HelpRequest, PetPost, SamOrder, Carpool } = require('../models');

const TOKEN = process.env.WX_MSG_TOKEN || 'neighborhub';

// 内容类型 -> 模型映射
const modelMap = {
  product: Product,
  post: Post,
  help: HelpRequest,
  pet: PetPost,
  sam: SamOrder,
  carpool: Carpool
};

// GET /api/wechat/callback - 微信服务器验证
router.get('/callback', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query;
  const hash = crypto.createHash('sha1')
    .update([TOKEN, timestamp, nonce].sort().join(''))
    .digest('hex');
  if (hash === signature) {
    res.send(echostr);
  } else {
    res.status(403).send('forbidden');
  }
});

// POST /api/wechat/callback - 接收微信异步内容检测结果
router.post('/callback', async (req, res) => {
  try {
    // 立即回复 success，避免微信重试
    res.send('success');

    const body = req.body;
    // 只处理内容安全检测回调
    if (!body || body.MsgType !== 'event' || body.Event !== 'wxa_media_check') {
      return;
    }

    const traceId = body.trace_id;
    const suggest = body.result && body.result.suggest;

    if (!traceId) return;

    const record = await MediaCheck.findOne({ where: { trace_id: traceId } });
    if (!record) return;

    if (suggest === 'risky' || suggest === 'review') {
      await record.update({ status: 'risky' });

      // 下架违规内容
      const Model = modelMap[record.content_type];
      if (Model) {
        const item = await Model.findByPk(record.content_id);
        if (item) {
          if (typeof item.status !== 'undefined') {
            await item.update({ status: 'off' });
          } else {
            await item.destroy();
          }
          console.log(`[内容安全] 已下架违规内容: ${record.content_type}#${record.content_id}`);
        }
      }
    } else {
      await record.update({ status: 'pass' });
    }
  } catch (err) {
    console.error('处理内容安全回调异常:', err.message);
  }
});

module.exports = router;
