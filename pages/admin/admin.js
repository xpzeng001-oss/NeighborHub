const api = require('../../utils/api');

const TAB_CONFIG = {
  product: { loader: (p) => api.getProducts({ page: p, pageSize: 20 }), detail: '/pages/detail/detail?id=' },
  post:    { loader: (p) => api.getPosts({ page: p, pageSize: 20 }),    detail: '/pages/forumDetail/forumDetail?id=' },
  pet:     { loader: (p) => api.getPets({ page: p, pageSize: 20 }),     detail: '/pages/petDetail/petDetail?id=' },
  sam:     { loader: (p) => api.getSams({ page: p, pageSize: 20 }),     detail: '/pages/samDetail/samDetail?id=' }
};

const DELETE_API = {
  product: (id) => api.deleteProduct(id),
  post:    (id) => api.deletePost(id),
  pet:     (id) => api.deletePet(id),
  sam:     (id) => api.deleteSam(id)
};

Page({
  data: {
    tab: 'product',
    list: [],
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    if (this._needRefresh) {
      this._needRefresh = false;
      this.setData({ page: 1, list: [], hasMore: true });
      this.loadData();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, list: [], hasMore: true });
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.tab) return;
    this.setData({ tab, page: 1, list: [], hasMore: true });
    this.loadData();
  },

  async loadData() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const config = TAB_CONFIG[this.data.tab];
      const result = await config.loader(this.data.page);
      const newList = result.list || [];
      this.setData({
        list: this.data.page === 1 ? newList : [...this.data.list, ...newList],
        page: this.data.page + 1,
        hasMore: newList.length >= 20,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadData();
    }
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    const config = TAB_CONFIG[this.data.tab];
    this._needRefresh = true;
    wx.navigateTo({ url: config.detail + id });
  },

  onDelete(e) {
    const { id, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确认删除？',
      confirmColor: '#E8636F',
      success: async (res) => {
        if (res.confirm) {
          try {
            await DELETE_API[this.data.tab](id);
            const list = this.data.list.slice();
            list.splice(index, 1);
            this.setData({ list });
            wx.showToast({ title: '已删除', icon: 'success' });
          } catch (err) {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
