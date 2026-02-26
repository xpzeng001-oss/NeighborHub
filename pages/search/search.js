// pages/search/search.js
const api = require('../../utils/api');

Page({
  data: {
    keyword: '',
    searched: false,
    results: [],
    searchHistory: [],
    hotKeywords: ['婴儿推车', '书架', 'iPad', '哑铃', '花盆', '儿童绘本', '电钻', '自行车']
  },

  onLoad() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
    if (!e.detail.value) {
      this.setData({ searched: false, results: [] });
    }
  },

  async onSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;

    // 保存搜索历史
    let history = this.data.searchHistory;
    history = history.filter(h => h !== keyword);
    history.unshift(keyword);
    history = history.slice(0, 10);
    this.setData({ searchHistory: history });
    wx.setStorageSync('searchHistory', history);

    // 搜索
    try {
      const data = await api.getProducts({ keyword });
      this.setData({ results: data.list || [], searched: true });
    } catch (err) {
      this.setData({ results: [], searched: true });
    }
  },

  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword });
    this.onSearch();
  },

  clearKeyword() {
    this.setData({ keyword: '', searched: false, results: [] });
  },

  clearHistory() {
    this.setData({ searchHistory: [] });
    wx.removeStorageSync('searchHistory');
  },

  goBack() {
    wx.navigateBack();
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
