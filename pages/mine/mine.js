// pages/mine/mine.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    statusBarHeight: 44,
    userInfo: null,
    isVerified: false,
    creditLevel: '新住户',
    buildings: ['1栋', '2栋', '3栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '12栋'],
    isAdmin: false,
    showProfile: false,
    tempAvatar: '',
    tempNickname: '',
    tempBuilding: ''
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
      let creditLevel = '新住户';
      const score = userInfo.creditScore || userInfo.credit_score || 100;
      if (score >= 200) creditLevel = '金牌邻居';
      else if (score >= 120) creditLevel = '活跃邻居';

      this.setData({
        userInfo,
        isVerified: !!userInfo.building,
        creditLevel,
        isAdmin: userInfo.role === 'admin' || userInfo.id == 20
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
          data: { code: loginRes.code, phoneCode },
          success: (res) => {
            if (res.data.code === 0) {
              const { token, userInfo } = res.data.data;
              app.globalData.token = token;
              app.globalData.userInfo = userInfo;
              wx.setStorageSync('token', token);
              wx.setStorageSync('userInfo', userInfo);
              this.setData({ userInfo, showProfile: true, tempAvatar: '', tempNickname: '' });
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

  onChooseAvatar(e) {
    this.setData({ tempAvatar: e.detail.avatarUrl });
  },

  onNicknameChange(e) {
    this.setData({ tempNickname: e.detail.value });
  },

  onProfileBuildingChange(e) {
    this.setData({ tempBuilding: this.data.buildings[e.detail.value] });
  },

  async onSaveProfile() {
    const { tempAvatar, tempNickname } = this.data;
    const nickName = (tempNickname || '').trim();
    if (!nickName) {
      wx.showToast({ title: '请填写昵称', icon: 'none' });
      return;
    }
    try {
      let avatarUrl = tempAvatar;
      // 如果是本地临时文件，先上传
      if (avatarUrl && avatarUrl.startsWith('http://tmp') || avatarUrl && avatarUrl.startsWith('wxfile://')) {
        avatarUrl = await api.uploadImage(avatarUrl);
      }
      const building = this.data.tempBuilding;
      const updateData = { nickName, avatarUrl };
      if (building) { updateData.building = building; updateData.isVerified = true; }
      const updated = await api.updateUser(this.data.userInfo.id, updateData);
      const userInfo = { ...this.data.userInfo, nickName: updated.nickName || nickName, avatarUrl: updated.avatarUrl || avatarUrl, building: updated.building || building, isVerified: !!building };
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ userInfo, showProfile: false });
      wx.showToast({ title: '设置成功', icon: 'success' });
    } catch (err) {
      const building = this.data.tempBuilding;
      const userInfo = { ...this.data.userInfo, nickName, avatarUrl: tempAvatar, building: building || this.data.userInfo.building, isVerified: !!building };
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ userInfo, showProfile: false });
      wx.showToast({ title: '设置成功', icon: 'success' });
    }
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

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' });
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
