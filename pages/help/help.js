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
    const id = e.currentTarget.dataset.id;
    const helps = this.data.helps.map(h => {
      if (h.id === id) return { ...h, responded: true };
      return h;
    });
    this.setData({ helps });
    wx.showToast({ title: '已响应，等待对方确认', icon: 'success' });
  },

  onContact(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.helps.find(h => h.id === id);
    if (!item) return;
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.onContact(e); });
      return;
    }
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetId=' + item.userId + '&targetName=' + encodeURIComponent(item.userName)
    });
  },

  goPublish() {
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => {
        wx.navigateTo({ url: '/pages/publish/publish?type=help' });
      });
      return;
    }
    wx.navigateTo({ url: '/pages/publish/publish?type=help' });
  }
});
