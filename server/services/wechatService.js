const axios = require('axios');
const wechatConfig = require('../config/wechat');

// access_token 缓存
let tokenCache = { token: null, expiresAt: 0 };

exports.getAccessToken = async () => {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const { data } = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
    params: {
      grant_type: 'client_credential',
      appid: wechatConfig.appId,
      secret: wechatConfig.appSecret
    }
  });
  if (data.errcode) {
    throw new Error(data.errmsg || '获取access_token失败');
  }
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000 // 提前5分钟过期
  };
  return tokenCache.token;
};

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

// 通过 phoneCode 获取用户手机号
exports.getPhoneNumber = async (phoneCode) => {
  const accessToken = await exports.getAccessToken();

  // 用 phoneCode 换取手机号
  const { data } = await axios.post(
    'https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=' + accessToken,
    { code: phoneCode }
  );
  if (data.errcode) {
    throw new Error(data.errmsg || '获取手机号失败');
  }
  return data.phone_info.purePhoneNumber || data.phone_info.phoneNumber;
};
