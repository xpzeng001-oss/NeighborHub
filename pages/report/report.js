const api = require('../../utils/api');

const STATUS_MAP = {
  pending: '处理中',
  resolved: '已处理',
  rejected: '已驳回'
};

const TYPE_MAP = {
  product: '商品',
  post: '帖子',
  user: '用户'
};

Page({
  data: {
    list: [],
    loading: true
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      const result = await api.getReports();
      const list = (result.list || []).map(item => ({
        ...item,
        statusText: STATUS_MAP[item.status] || item.status,
        typeText: TYPE_MAP[item.targetType] || item.targetType
      }));
      this.setData({ list, loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  }
});
