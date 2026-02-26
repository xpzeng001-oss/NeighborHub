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
    wx.showToast({ title: '联系功能开发中', icon: 'none' });
  }
});
