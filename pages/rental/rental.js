// pages/rental/rental.js
const { mockRentals } = require('../../utils/mockData');

Page({
  data: { rentals: [] },

  onLoad() {
    this.setData({ rentals: mockRentals });
  },

  onContact(e) {
    wx.showToast({ title: '联系功能开发中', icon: 'none' });
  }
});
