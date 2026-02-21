// pages/mine/mine.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    isVerified: false,
    creditLevel: '新住户',
    stats: { published: 3, favorites: 5, sold: 1, bought: 2 }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      let creditLevel = '新住户';
      const score = userInfo.credit_score || 100;
      if (score >= 200) creditLevel = '金牌邻居';
      else if (score >= 120) creditLevel = '活跃邻居';

      this.setData({
        userInfo,
        isVerified: !!userInfo.building,
        creditLevel
      });
    }
  },

  onLogin() {
    app.login((userInfo) => {
      this.setData({ userInfo });
    });
  },

  goMyPublish() {
    wx.showToast({ title: '我的发布', icon: 'none' });
  },

  goMyFav() {
    wx.showToast({ title: '我的收藏', icon: 'none' });
  },

  goVerify() {
    if (!this.data.userInfo) {
      this.onLogin();
      return;
    }
    wx.showActionSheet({
      itemList: ['1栋', '2栋', '3栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '12栋'],
      success: (res) => {
        const buildings = ['1栋', '2栋', '3栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '12栋'];
        const building = buildings[res.tapIndex];
        const userInfo = this.data.userInfo;
        userInfo.building = building;
        app.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ userInfo, isVerified: true });
        wx.showToast({ title: '认证成功：' + building, icon: 'success' });
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
