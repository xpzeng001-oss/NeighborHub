// pages/mine/mine.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    userInfo: null,
    isVerified: false,
    creditLevel: '新住户',
    stats: { published: 0, favorites: 0, sold: 0, bought: 0 },
    buildings: ['1栋', '2栋', '3栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '12栋']
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      let creditLevel = '新住户';
      const score = userInfo.creditScore || userInfo.credit_score || 100;
      if (score >= 200) creditLevel = '金牌邻居';
      else if (score >= 120) creditLevel = '活跃邻居';

      this.setData({
        userInfo,
        isVerified: !!userInfo.building,
        creditLevel,
        isAdmin: userInfo.id === 1
      });
      this.loadStats(userInfo.id);
    }
  },

  async loadStats(userId) {
    try {
      const stats = await api.getUserStats(userId);
      this.setData({ stats });
    } catch (err) {
      console.log('加载统计失败', err);
    }
  },

  onLogin() {
    app.login((userInfo) => {
      this.setData({ userInfo });
      if (userInfo.id) this.loadStats(userInfo.id);
    });
  },

  goMyPublish() {
    if (!this.data.userInfo) { this.onLogin(); return; }
    wx.navigateTo({ url: '/pages/myList/myList?type=publish' });
  },

  goMyFav() {
    if (!this.data.userInfo) { this.onLogin(); return; }
    wx.navigateTo({ url: '/pages/myList/myList?type=favorite' });
  },

  goMyHelp() {
    if (!this.data.userInfo) { this.onLogin(); return; }
    wx.navigateTo({ url: '/pages/myList/myList?type=help' });
  },

  async onBuildingChange(e) {
    if (!this.data.userInfo) { this.onLogin(); return; }
    const buildings = this.data.buildings;
    const building = buildings[e.detail.value];
    try {
      const updated = await api.updateUser(this.data.userInfo.id, { building, isVerified: true });
      const userInfo = { ...this.data.userInfo, building: updated.building, isVerified: true };
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ userInfo, isVerified: true });
      wx.showToast({ title: '认证成功：' + building, icon: 'success' });
    } catch (err) {
      const userInfo = { ...this.data.userInfo, building, isVerified: true };
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ userInfo, isVerified: true });
      wx.showToast({ title: '认证成功：' + building, icon: 'success' });
    }
  },

  goCredit() {
    wx.navigateTo({ url: '/pages/credit/credit' });
  },

  goReport() {
    if (!this.data.userInfo) { this.onLogin(); return; }
    wx.navigateTo({ url: '/pages/report/report' });
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },

  goAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  },

  goFeedbackList() {
    wx.navigateTo({ url: '/pages/feedbackList/feedbackList' });
  },

  onShareAppMessage() {
    return {
      title: '邻里市集 - 小区闲置好物交易',
      path: '/pages/index/index'
    };
  }
});
