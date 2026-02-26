// pages/mine/mine.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    userInfo: null,
    isVerified: false,
    creditLevel: '新住户',
    stats: { published: 0, favorites: 0, sold: 0, bought: 0 }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
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
        creditLevel
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
    wx.showToast({ title: '我的发布', icon: 'none' });
  },

  goMyFav() {
    wx.showToast({ title: '我的收藏', icon: 'none' });
  },

  async goVerify() {
    if (!this.data.userInfo) {
      this.onLogin();
      return;
    }
    wx.showActionSheet({
      itemList: ['1栋', '2栋', '3栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '12栋'],
      success: async (res) => {
        const buildings = ['1栋', '2栋', '3栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '12栋'];
        const building = buildings[res.tapIndex];
        try {
          const updated = await api.updateUser(this.data.userInfo.id, { building, isVerified: true });
          const userInfo = { ...this.data.userInfo, building: updated.building, isVerified: true };
          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
          this.setData({ userInfo, isVerified: true });
          wx.showToast({ title: '认证成功：' + building, icon: 'success' });
        } catch (err) {
          // 离线模式回退
          const userInfo = this.data.userInfo;
          userInfo.building = building;
          app.globalData.userInfo = userInfo;
          wx.setStorageSync('userInfo', userInfo);
          this.setData({ userInfo, isVerified: true });
          wx.showToast({ title: '认证成功：' + building, icon: 'success' });
        }
      }
    });
  },

  onShare() { },

  onShareAppMessage() {
    return {
      title: '邻里市集 - 小区闲置好物交易',
      path: '/pages/index/index'
    };
  }
});
