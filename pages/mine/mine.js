// pages/mine/mine.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    statusBarHeight: 44,
    userInfo: null,
    isVerified: false,
    buildings: ['1栋', '2栋', '3栋', '4栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '11栋', '12栋'],
    communities: [],
    communityNames: [],
    verifyPickerValue: [0, 0],
    isAdmin: false,
    showProfileGuide: false,
    guideNickName: '',
    guideCommunityIndex: 0,
    guideBuildingIndex: 0,
    guideSaving: false,
    showContactEdit: false,
    editPhone: '',
    editWechat: ''
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
      const isVerified = !!(userInfo.community && userInfo.building);
      this.setData({
        userInfo,
        isVerified,
        isAdmin
      });
      // 检查是否需要引导完善信息
      const needGuide = !userInfo.community || !userInfo.building;
      if (needGuide && !this.data.showProfileGuide) {
        this.setData({
          showProfileGuide: true,
          guideNickName: userInfo.nickName || ''
        });
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
          this.getTabBar().setData({ show: false });
        }
      }
    }
    this.loadCommunities();
  },

  async loadCommunities() {
    let communities = app.globalData.communities || [];
    if (communities.length === 0) {
      try {
        const data = await api.getCommunities();
        communities = data.list || data || [];
        app.globalData.communities = communities;
      } catch (e) {}
    }
    const communityNames = communities.map(c => c.name);
    const userInfo = this.data.userInfo;
    let cIdx = 0, bIdx = 0;
    if (userInfo) {
      const community = userInfo.community || userInfo.communityName || '';
      cIdx = Math.max(0, communityNames.indexOf(community));
      bIdx = Math.max(0, this.data.buildings.indexOf(userInfo.building));
    }
    this.setData({ communities, communityNames, verifyPickerValue: [cIdx, bIdx] });
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

  onVerifyPickerChange(e) {
    this.setData({ verifyPickerValue: e.detail.value });
  },

  async onVerifyConfirm(e) {
    if (!this.data.userInfo) { this.onLogin(); return; }
    const [cIdx, bIdx] = e.detail.value;
    const community = this.data.communities[cIdx];
    const building = this.data.buildings[bIdx];
    if (!community) {
      wx.showToast({ title: '请选择小区', icon: 'none' });
      return;
    }
    try {
      await api.updateUser(this.data.userInfo.id, { building, isVerified: true });
    } catch (err) {}
    const userInfo = { ...this.data.userInfo, community: community.name, communityName: community.name, building, isVerified: true };
    app.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
    app.globalData.currentCommunity = community;
    wx.setStorageSync('currentCommunity', community);
    this.setData({ userInfo, isVerified: true, verifyPickerValue: [cIdx, bIdx] });
    wx.showToast({ title: '认证成功', icon: 'success' });
  },

  onGuideNicknameInput(e) {
    this.setData({ guideNickName: e.detail.value });
  },

  onGuideCommunityChange(e) {
    this.setData({ guideCommunityIndex: e.detail.value });
  },

  onGuideBuildingChange(e) {
    this.setData({ guideBuildingIndex: e.detail.value });
  },

  async onGuideSave() {
    const { guideNickName, guideCommunityIndex, guideBuildingIndex, communities, buildings, guideSaving } = this.data;
    if (guideSaving) return;
    const nickName = guideNickName.trim();
    if (!nickName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (nickName.length > 20) {
      wx.showToast({ title: '昵称不能超过20个字', icon: 'none' });
      return;
    }
    const community = communities[guideCommunityIndex];
    if (!community) {
      wx.showToast({ title: '请选择小区', icon: 'none' });
      return;
    }
    const building = buildings[guideBuildingIndex];

    this.setData({ guideSaving: true });
    try {
      const updated = await api.updateUser(this.data.userInfo.id, {
        nickName,
        building,
        isVerified: true
      });
      const userInfo = {
        ...this.data.userInfo,
        nickName: updated.nickName || nickName,
        community: community.name,
        communityName: community.name,
        building: updated.building || building,
        isVerified: true
      };
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      app.globalData.currentCommunity = community;
      wx.setStorageSync('currentCommunity', community);
      this.setData({ userInfo, isVerified: true, showProfileGuide: false });
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ show: true });
      }
      wx.showToast({ title: '设置成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    } finally {
      this.setData({ guideSaving: false });
    }
  },

  goSettings() {
    if (!this.data.userInfo) { this.onLogin(); return; }
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  showContactEdit() {
    const userInfo = app.globalData.userInfo || {};
    this.setData({
      showContactEdit: true,
      editPhone: userInfo.phone || '',
      editWechat: userInfo.wechatId || ''
    });
  },

  closeContactEdit() {
    this.setData({ showContactEdit: false });
  },

  preventBubble() {},

  onEditPhone(e) {
    this.setData({ editPhone: e.detail.value });
  },

  onEditWechat(e) {
    this.setData({ editWechat: e.detail.value });
  },

  async onContactEditSave() {
    const { editPhone, editWechat } = this.data;
    if (!editPhone.trim() && !editWechat.trim()) {
      wx.showToast({ title: '请至少填写一项', icon: 'none' });
      return;
    }
    if (editPhone && !/^1\d{10}$/.test(editPhone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    try {
      const userInfo = app.globalData.userInfo;
      const updateData = { phone: editPhone, wechatId: editWechat };
      await api.updateUser(userInfo.id, updateData);
      userInfo.phone = editPhone;
      userInfo.wechatId = editWechat;
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ showContactEdit: false, userInfo });
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
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

  goDashboard() {
    wx.navigateTo({ url: '/pages/dashboard/dashboard' });
  },

  goAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' });
  },
  goUserManage() {
    wx.navigateTo({ url: '/pages/admin/admin?mode=user' });
  },

  goWechatGroupManage() {
    wx.navigateTo({ url: '/pages/admin/admin?tab=wechatGroup' });
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
