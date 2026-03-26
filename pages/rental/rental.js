// pages/rental/rental.js
const api = require('../../utils/api');

Page({
  data: { rentals: [] },

  onShow() {
    this.loadData();
  },

  async loadData() {
    try {
      const app = getApp();
      const district = app.globalData.currentDistrict;
      const params = {};
      if (district && district.id) params.districtId = district.id;
      const data = await api.getRentals(params);
      this.setData({ rentals: data.list || [] });
    } catch (err) {
      console.log('加载租赁列表失败', err);
    }
  },

  onShareAppMessage() {
    return {
      title: '邻里租赁信息',
      path: '/pages/rental/rental'
    };
  },

  onContact(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.rentals.find(r => r.id === id);
    if (!item || !item.userId) return;
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.onContact(e); });
      return;
    }
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + item.userId +
        '&nickName=' + encodeURIComponent(item.userName || '') +
        '&avatarUrl=' + encodeURIComponent(item.userAvatar || '')
    });
  }
});
