const app = getApp();
const api = require('../../utils/api');

const typeMap = {
  need: { label: '寻求喂养', icon: 'paw-print', color: '#E8883C' },
  offer: { label: '可以帮喂', icon: 'heart', color: '#C67A52' },
  social: { label: '宠物活动', icon: 'sparkles', color: '#8B6DB0' }
};

const btnTextMap = {
  need: '我来帮忙',
  offer: '我需要',
  social: '我要参加'
};

Page({
  data: {
    statusBarHeight: 44,
    detail: null,
    typeInfo: {},
    btnText: '',
    respondents: [],
    responded: false,
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight });
    if (options.id) {
      this.loadDetail(options.id);
    }
  },

  async loadDetail(id) {
    try {
      const data = await api.getPetDetail(id);
      const detail = data || {};
      this.setData({
        detail,
        typeInfo: typeMap[detail.type] || typeMap.need,
        btnText: btnTextMap[detail.type] || '我要参加',
        respondents: detail.respondents || []
      });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  goBack() {
    wx.navigateBack();
  },

  onContact() {
    const item = this.data.detail;
    if (!item || !item.userId) return;
    if (!app.globalData.userInfo) {
      app.login(() => { this.onContact(); });
      return;
    }
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + item.userId +
        '&nickName=' + encodeURIComponent(item.userName || '') +
        '&avatarUrl=' + encodeURIComponent(item.userAvatar || '')
    });
  },

  async onRespond() {
    const item = this.data.detail;
    if (!item) return;
    if (!app.globalData.userInfo) {
      app.login(() => { this.onRespond(); });
      return;
    }
    try {
      const data = await api.respondPet(item.id);
      this.setData({
        'detail.responseCount': data.responseCount,
        responded: true,
        respondents: data.respondents || this.data.respondents
      });
      wx.showToast({ title: '报名成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: err.message || '报名失败', icon: 'none' });
    }
  },

  onShareAppMessage() {
    const d = this.data.detail;
    return {
      title: d ? d.title : '宠物喂养',
      path: '/pages/petDetail/petDetail?id=' + (d ? d.id : '')
    };
  }
});
