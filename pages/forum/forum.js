// pages/forum/forum.js
const api = require('../../utils/api');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    tabs: ['全部', '公告', '吐槽', '求助', '活动'],
    forumTab: '全部',
    posts: [],
    filteredPosts: [],
    isRefreshing: false
  },

  onShow() {
    this.loadPosts();
  },

  async loadPosts() {
    try {
      const catClassMap = { '公告': 'announcement', '吐槽': 'complaint', '求助': 'question', '活动': 'activity' };
      const params = {};
      if (this.data.forumTab !== '全部') {
        params.category = this.data.forumTab;
      }
      const data = await api.getPosts(params);
      const posts = (data.list || []).map(p => ({
        ...p,
        timeAgo: formatTime(new Date(p.createdAt)),
        categoryClass: catClassMap[p.category] || 'default'
      }));
      this.setData({ posts, filteredPosts: posts });
    } catch (err) {
      console.error('加载帖子失败', err);
      wx.showToast({ title: '加载失败，请下拉刷新', icon: 'none' });
    }
  },

  switchTab(e) {
    this.setData({ forumTab: e.currentTarget.dataset.tab });
    this.loadPosts();
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
