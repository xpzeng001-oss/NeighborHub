const { Op } = require('sequelize');
const { CoinLog, User } = require('../models');

// 奖励配置
const REWARDS = {
  publish_product: { coins: 5, dailyLimit: 3 },   // 发布闲置/免费送
  publish_post:    { coins: 3, dailyLimit: 5 },    // 发帖（论坛/互助/拼车/团购/宠物）
  daily_login:     { coins: 1, dailyLimit: 1 },    // 每日登录
  trade_complete:  { coins: 10, dailyLimit: null }, // 交易完成
  invite:          { coins: 20, dailyLimit: null }  // 邀请好友
};

// 获取今日零点
function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 发放邻里币
 * @param {number} userId
 * @param {string} action - REWARDS 中的 key
 * @param {number|null} refId - 关联内容ID
 * @returns {number|null} 实际发放的币数，null 表示已达上限
 */
async function grant(userId, action, refId = null) {
  const config = REWARDS[action];
  if (!config) return null;

  // 检查每日上限
  if (config.dailyLimit !== null) {
    const count = await CoinLog.count({
      where: {
        user_id: userId,
        action,
        created_at: { [Op.gte]: todayStart() }
      }
    });
    if (count >= config.dailyLimit) return null;
  }

  // 写入流水
  await CoinLog.create({
    user_id: userId,
    action,
    coins: config.coins,
    ref_id: refId
  });

  // 增加用户邻里币
  await User.increment('coins', { by: config.coins, where: { id: userId } });

  return config.coins;
}

module.exports = { grant, REWARDS };
