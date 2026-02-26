const axios = require('axios');
const wechatConfig = require('../config/wechat');

exports.code2Session = async (code) => {
  const { data } = await axios.get(wechatConfig.code2SessionUrl, {
    params: {
      appid: wechatConfig.appId,
      secret: wechatConfig.appSecret,
      js_code: code,
      grant_type: 'authorization_code'
    }
  });

  if (data.errcode) {
    const err = new Error(data.errmsg || '微信登录失败');
    err.statusCode = 400;
    throw err;
  }

  return {
    openid: data.openid,
    sessionKey: data.session_key
  };
};
