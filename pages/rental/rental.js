// pages/rental/rental.js
const api = require('../../utils/api');

Page({
  data: { rentals: [] },

  async onLoad() {
    try {
      const data = await api.getRentals();
      this.setData({ rentals: data.list || [] });
    } catch (err) {
      console.log('加载租赁列表失败', err);
    }
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
