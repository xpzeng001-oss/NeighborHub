const axios = require('axios');
const wechatService = require('./wechatService');
const wechatConfig = require('../config/wechat');
const { MediaCheck } = require('../models');

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

/**
 * 微信多媒体内容安全异步检测 (mediaCheckAsync)
 * 异步检测图片，结果通过微信回调推送
 * @param {string} openid       用户 openid
 * @param {string} mediaUrl     图片 URL
 * @param {string} contentType  内容类型: product, post, help, pet, sam, carpool
 * @param {number} contentId    内容 ID
 * @param {number} scene        场景值: 1=资料 2=评论 3=论坛 4=社交日志
 */
exports.mediaCheck = async (openid, mediaUrl, contentType, contentId, scene = 2) => {
  try {
    const accessToken = await wechatService.getAccessToken();
    const { data } = await axios.post(
      `https://api.weixin.qq.com/wxa/media_check_async?access_token=${accessToken}`,
      {
        openid,
        media_url: mediaUrl,
        media_type: 2, // 2=图片
        version: 2,
        scene
      }
    );

    if (data.errcode !== 0) {
      console.error('mediaCheckAsync API error:', data);
      return;
    }

    // 记录 trace_id 与内容的映射关系
    await MediaCheck.create({
      trace_id: data.trace_id,
      content_type: contentType,
      content_id: contentId,
      media_url: mediaUrl
    });
  } catch (err) {
    console.error('图片安全检测异常:', err.message);
  }
};

/**
 * 批量提交图片检测（非阻塞）
 * @param {string} openid
 * @param {string[]} imageUrls
 * @param {string} contentType
 * @param {number} contentId
 */
exports.checkImages = (openid, imageUrls, contentType, contentId) => {
  if (!openid || !imageUrls || imageUrls.length === 0) return;
  // 异步执行，不阻塞主流程
  Promise.all(
    imageUrls.map(url => exports.mediaCheck(openid, url, contentType, contentId))
  ).catch(err => console.error('批量图片检测异常:', err.message));
};

/**
 * 获取用户安全等级 (getUserRiskRank)
 * risk_rank: 0=正常 1=可疑 2=有风险 3=危险 4=已封禁
 * @param {string} openid    用户 openid
 * @param {string} clientIp  用户客户端 IP
 * @param {number} scene     场景值: 0=注册 1=营销
 * @returns {Promise<{safe: boolean, riskRank: number}>}
 */
exports.getUserRiskRank = async (openid, clientIp, scene = 1) => {
  try {
    const accessToken = await wechatService.getAccessToken();
    const { data } = await axios.post(
      `https://api.weixin.qq.com/wxa/getuserriskrank?access_token=${accessToken}`,
      {
        appid: wechatConfig.appId,
        openid,
        scene,
        client_ip: clientIp
      }
    );

    if (data.errcode !== 0) {
      console.error('getUserRiskRank API error:', data);
      return { safe: true, riskRank: 0 };
    }

    // risk_rank >= 3 视为高风险，拦截操作
    return { safe: data.risk_rank < 3, riskRank: data.risk_rank };
  } catch (err) {
    console.error('用户风险等级检测异常:', err.message);
    return { safe: true, riskRank: 0 };
  }
};
