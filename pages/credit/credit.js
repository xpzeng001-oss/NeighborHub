const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    coins: 0,
    rules: [
      { action: '发布闲置/免费送', point: '+5', desc: '每次发布，每日最多3次' },
      { action: '发帖', point: '+3', desc: '论坛/互助/拼车/团购/宠物，每日最多5次' },
      { action: '每日登录', point: '+1', desc: '每天首次打开小程序' },
      { action: '交易完成', point: '+10', desc: '标记商品已售出' },
      { action: '邀请好友', point: '+20', desc: '好友完成社区认证后发放' }
    ],
    logs: [],
    hasMore: true,
    page: 1
  },

  onLoad() {
    this.refreshCoins();
    this.loadLogs();
  },

  refreshCoins() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) return;

    this.setData({ coins: userInfo.coins || 0 });
  },

  async loadLogs() {
    try {
      const res = await api.getCoinLogs({ page: this.data.page, pageSize: 20 });
      const logs = this.data.page === 1 ? res.list : [...this.data.logs, ...res.list];
      this.setData({
        logs,
        hasMore: logs.length < res.total
      });
    } catch (e) {
      // ignore
    }
  },

  loadMore() {
    if (!this.data.hasMore) return;
    this.setData({ page: this.data.page + 1 });
    this.loadLogs();
  }
});
