// pages/help/help.js
const { mockHelps } = require('../../utils/mockData');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    helps: []
  },

  onLoad() {
    const helps = mockHelps.map(h => ({
      ...h,
      timeAgo: formatTime(new Date(h.createdAt))
    }));
    // 紧急优先
    helps.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
    this.setData({ helps });
  },

  onHelp(e) {
    wx.showToast({ title: '已通知对方，请等待回复', icon: 'success' });
  },

  onContact(e) {
    wx.showToast({ title: '联系功能开发中', icon: 'none' });
  },

  goPublish() {
    wx.switchTab({ url: '/pages/publish/publish' });
  }
});
