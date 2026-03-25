// pages/forum/forum.js
const api = require('../../utils/api');
const formatTime = d => { const df = Date.now() - d; if (df < 60000) return '刚刚'; if (df < 3600000) return Math.floor(df/60000)+'分钟前'; if (df < 86400000) return Math.floor(df/3600000)+'小时前'; if (df < 604800000) return Math.floor(df/86400000)+'天前'; const m = d.getMonth()+1, day = d.getDate(); return d.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(day<10?'0'+day:day); };

Page({
  data: {
    posts: [],
    filteredPosts: [],
    isRefreshing: false
  },

  onShow() {
    this.loadPosts();
  },

  async loadPosts() {
    try {
      const app = getApp();
      const district = app.globalData.currentDistrict;
      const params = {};
      if (district && district.id) params.districtId = district.id;
      const data = await api.getPosts(params);
      const posts = (data.list || []).map(p => ({
        ...p,
        timeAgo: formatTime(new Date(p.createdAt))
      }));
      this.setData({ posts, filteredPosts: posts });
    } catch (err) {
      console.error('[forum] 加载帖子失败', err);
      wx.showToast({ title: '加载失败，请下拉刷新', icon: 'none' });
    }
  },

  async onRefresh() {
    this.setData({ isRefreshing: true });
    await this.loadPosts();
    this.setData({ isRefreshing: false });
  },

  goPostDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/forumDetail/forumDetail?id=' + id });
  },

  goPublish() {
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => {
        wx.navigateTo({ url: '/pages/forumPublish/forumPublish' });
      });
      return;
    }
    wx.navigateTo({ url: '/pages/forumPublish/forumPublish' });
  }
});
