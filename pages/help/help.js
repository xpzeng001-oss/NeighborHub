// pages/help/help.js
const api = require('../../utils/api');
const formatTime = d => { const df = Date.now() - d; if (df < 60000) return '刚刚'; if (df < 3600000) return Math.floor(df/60000)+'分钟前'; if (df < 86400000) return Math.floor(df/3600000)+'小时前'; if (df < 604800000) return Math.floor(df/86400000)+'天前'; const m = d.getMonth()+1, day = d.getDate(); return d.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(day<10?'0'+day:day); };

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

  async onHelp(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.onHelp(e); });
      return;
    }
    try {
      await api.respondHelp(id);
      const helps = this.data.helps.map(h => {
        if (h.id === id) return { ...h, responded: true, status: 'fulfilled' };
        return h;
      });
      this.setData({ helps });
      wx.showToast({ title: '已响应，等待对方确认', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '响应失败', icon: 'none' });
    }
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
