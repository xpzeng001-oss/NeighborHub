// pages/help/help.js
const api = require('../../utils/api');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    helps: []
  },

  async onLoad() {
    try {
      const data = await api.getHelps();
      const helps = (data.list || []).map(h => ({
        ...h,
        timeAgo: formatTime(new Date(h.createdAt))
      }));
      this.setData({ helps });
    } catch (err) {
      console.log('加载帮忙列表失败', err);
    }
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
