// pages/mine/mine.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    statusBarHeight: 44,
    userInfo: null,
    isVerified: false,
    buildings: ['1栋', '2栋', '3栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '12栋'],
    isAdmin: false
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    const userInfo = app.globalData.userInfo;
    if (!userInfo && app._loginCallback) {
      this.onQuickLogin();
    }
    if (userInfo) {
      const isAdmin = userInfo.role === 'admin' || userInfo.id == 20;
      this.setData({
        userInfo,
        isVerified: !!userInfo.building,
        isAdmin
      });
    }
  },

  onLogin() {
    // 其他页面调用 app.login() 跳转过来时，需要用户点击触发
  },

  onGetPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') return;
    const phoneCode = e.detail.code;
    wx.login({
      success: (loginRes) => {
        wx.request({
          url: app.globalData.baseUrl + '/api/auth/login',
          method: 'POST',
          data: { code: loginRes.code, phoneCode, inviterId: app.globalData.inviterId || '' },
          success: (res) => {
            if (res.data.code === 0) {
              const { token, userInfo, avatarConfig } = res.data.data;
              app.globalData.token = token;
              app.globalData.userInfo = userInfo;
              if (avatarConfig) {
                app.globalData.avatarConfig = avatarConfig;
                wx.setStorageSync('avatarConfig', avatarConfig);
              }
              wx.setStorageSync('token', token);
              wx.setStorageSync('userInfo', userInfo);
              this.setData({ userInfo });
              if (app._loginCallback) {
                app._loginCallback(userInfo);
                app._loginCallback = null;
              }
              this.onShow();
            } else {
              wx.showToast({ title: res.data.message || '登录失败', icon: 'none' });
            }
          },
          fail: () => { wx.showToast({ title: '网络错误', icon: 'none' }); }
        });
      }
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

  goMyActivity() {
    if (!this.data.userInfo) { this.onLogin(); return; }
    wx.navigateTo({ url: '/pages/myList/myList?type=activity' });
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

  goSettings() {
    if (!this.data.userInfo) { this.onLogin(); return; }
    wx.navigateTo({ url: '/pages/settings/settings' });
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

  goDashboard() {
    wx.navigateTo({ url: '/pages/dashboard/dashboard' });
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' });
  },
  goUserManage() {
    wx.navigateTo({ url: '/pages/admin/admin?mode=user' });
  },

  goFeedbackList() {
    wx.navigateTo({ url: '/pages/feedbackList/feedbackList' });
  },

  onShareAppMessage() {
    const uid = this.data.userInfo ? this.data.userInfo.id : '';
    return {
      title: '邻里市集 - 小区闲置好物交易',
      path: '/pages/index/index?inviter=' + uid
    };
  }
});
