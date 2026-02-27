// pages/feedbackList/feedbackList.js
const api = require('../../utils/api');

Page({
  data: {
    list: [],
    page: 1,
    loading: false,
    noMore: false
  },

  onShow() {
    this.setData({ list: [], page: 1, noMore: false });
    this.loadData();
  },

  async loadData() {
    if (this.data.loading || this.data.noMore) return;
    this.setData({ loading: true });

    try {
      const res = await api.getFeedbacks({ page: this.data.page, pageSize: 20 });
      const newList = this.data.list.concat(res.list || []);
      this.setData({
        list: newList,
        page: this.data.page + 1,
        noMore: newList.length >= res.total,
        loading: false
      });
    } catch (err) {
      console.log('加载反馈失败', err);
      this.setData({ loading: false });
    }
  },

  loadMore() {
    this.loadData();
  }
});