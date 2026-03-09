const app = getApp();
const api = require('../../utils/api');

const TITLES = {
  publish: '我的发布',
  favorite: '我的收藏',
  help: '我的帮忙',
  activity: '我的参与',
  sam: '我的拼单',
  carpool: '我的拼车',
  pet: '我的宠物'
};

const ACTIVITY_TABS = [
  { key: 'help', name: '帮忙' },
  { key: 'sam', name: '拼单' },
  { key: 'carpool', name: '拼车' },
  { key: 'pet', name: '宠物' }
];

Page({
  data: {
    type: '',
    subType: 'help',
    activityTabs: ACTIVITY_TABS,
    list: [],
    loading: true,
    page: 1,
    hasMore: true
  },

  onLoad(options) {
    const type = options.type || 'publish';
    this.setData({ type });
    if (type === 'activity') {
      this.setData({ subType: 'help' });
    }
    wx.setNavigationBarTitle({ title: TITLES[type] || '' });
    this.loadData();
  },

  switchSubTab(e) {
    const subType = e.currentTarget.dataset.key;
    if (subType === this.data.subType) return;
    this.setData({ subType, list: [], page: 1, hasMore: true });
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

      const actualType = this.data.type === 'activity' ? this.data.subType : this.data.type;

      if (actualType === 'publish') {
        result = await api.getProducts({ userId: userInfo.id, page, pageSize: 20 });
      } else if (actualType === 'favorite') {
        result = await api.getMyFavorites({ page, pageSize: 20 });
      } else if (actualType === 'help') {
        result = await api.getHelps({ userId: userInfo.id, page, pageSize: 20 });
      } else if (actualType === 'sam') {
        result = await api.getSams({ userId: userInfo.id, page, pageSize: 20 });
      } else if (actualType === 'carpool') {
        result = await api.getCarpools({ userId: userInfo.id, page, pageSize: 20 });
      } else if (actualType === 'pet') {
        result = await api.getPets({ userId: userInfo.id, page, pageSize: 20 });
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
    const actualType = this.data.type === 'activity' ? this.data.subType : this.data.type;
    if (actualType === 'help') return;
    if (actualType === 'sam') {
      wx.navigateTo({ url: '/pages/samDetail/samDetail?id=' + id });
    } else if (actualType === 'pet') {
      wx.navigateTo({ url: '/pages/petDetail/petDetail?id=' + id });
    } else {
      wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
    }
  }
});
