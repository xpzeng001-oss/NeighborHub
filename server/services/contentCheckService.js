const axios = require('axios');
const wechatService = require('./wechatService');

/**
 * 微信内容安全文本检测 (msgSecCheck)
 * @param {string} openid  用户 openid
 * @param {string} content 待检测文本
 * @param {number} scene   场景值: 1=资料 2=评论 3=论坛 4=社交日志
 * @returns {Promise<{pass: boolean, label: number, errMsg: string}>}
 */
exports.textCheck = async (openid, content, scene = 2) => {
  if (!content || !content.trim()) {
    return { pass: true, label: 100, errMsg: '' };
  }

  try {
    const accessToken = await wechatService.getAccessToken();
    const { data } = await axios.post(
      `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}`,
      {
        openid,
        scene,
        version: 2,
        content
      }
    );

    if (data.errcode !== 0) {
      console.error('msgSecCheck API error:', data);
      // API 调用失败时放行，避免影响正常使用，但记录日志
      return { pass: true, label: 0, errMsg: data.errmsg };
    }

    const suggest = data.result && data.result.suggest;
    if (suggest === 'risky' || suggest === 'review') {
      return { pass: false, label: data.result.label, errMsg: '所发布内容含违规信息' };
    }

    return { pass: true, label: data.result ? data.result.label : 100, errMsg: '' };
  } catch (err) {
    console.error('内容安全检测异常:', err.message);
    // 异常时放行，避免阻塞用户
    return { pass: true, label: 0, errMsg: '' };
  }
};
