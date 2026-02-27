const app = getApp();
const api = require('../../utils/api');

const TITLES = {
  publish: '我的发布',
  favorite: '我的收藏',
  help: '我的帮忙'
};

Page({
  data: {
    type: '',
    list: [],
    loading: true,
    page: 1,
    hasMore: true
  },

  onLoad(options) {
    const type = options.type || 'publish';
    this.setData({ type });
    wx.setNavigationBarTitle({ title: TITLES[type] || '' });
    this.loadData();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadData();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, list: [], hasMore: true });
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  async loadData() {
    this.setData({ loading: true });
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      this.setData({ loading: false });
      return;
    }

    try {
      let result;
      const page = this.data.page;

      if (this.data.type === 'publish') {
        result = await api.getProducts({ userId: userInfo.id, page, pageSize: 20 });
      } else if (this.data.type === 'favorite') {
        result = await api.getMyFavorites({ page, pageSize: 20 });
      } else if (this.data.type === 'help') {
        result = await api.getHelps({ userId: userInfo.id, page, pageSize: 20 });
      }

      const newList = result.list || [];
      this.setData({
        list: page === 1 ? newList : [...this.data.list, ...newList],
        page: page + 1,
        hasMore: newList.length >= 20,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (this.data.type === 'help') return;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
