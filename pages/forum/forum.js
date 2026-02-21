// pages/forum/forum.js
const { mockPosts } = require('../../utils/mockData');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    tabs: ['全部', '公告', '吐槽', '求助', '活动'],
    forumTab: '全部',
    posts: [],
    filteredPosts: [],
    isRefreshing: false
  },

  onLoad() {
    this.loadPosts();
  },

  loadPosts() {
    const catClassMap = { '公告': 'announcement', '吐槽': 'complaint', '求助': 'question', '活动': 'activity' };
    const posts = mockPosts.map(p => ({
      ...p,
      timeAgo: formatTime(new Date(p.createdAt)),
      categoryClass: catClassMap[p.category] || 'default'
    }));
    // 置顶优先
    posts.sort((a, b) => (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0));
    this.setData({ posts });
    this.filterPosts();
  },

  filterPosts() {
    const tab = this.data.forumTab;
    let filtered = this.data.posts;
    if (tab !== '全部') {
      filtered = filtered.filter(p => p.category === tab);
    }
    this.setData({ filteredPosts: filtered });
  },

  switchTab(e) {
    this.setData({ forumTab: e.currentTarget.dataset.tab });
    this.filterPosts();
  },

  onRefresh() {
    this.setData({ isRefreshing: true });
    setTimeout(() => {
      this.loadPosts();
      this.setData({ isRefreshing: false });
    }, 600);
  },

  goPostDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/forumDetail/forumDetail?id=' + id });
  },

  goPublish() {
    wx.switchTab({ url: '/pages/publish/publish' });
  }
});
