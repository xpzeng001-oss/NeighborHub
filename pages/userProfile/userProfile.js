const app = getApp();
const api = require('../../utils/api');

const TABS = [
  { key: 'product', name: '商品' },
  { key: 'post', name: '帖子' },
  { key: 'activity', name: '活动' },
  { key: 'help', name: '互助' },
  { key: 'carpool', name: '拼车' },
  { key: 'pet', name: '宠物' },
  { key: 'sam', name: '代购' }
];

Page({
  data: {
    userId: null,
    userInfo: null,
    notFound: false,
    tabs: TABS,
    activeTab: 'product',
    list: [],
    loading: true,
    page: 1,
    hasMore: true
  },

  onLoad(options) {
    const userId = options.userId;
    if (!userId) {
      this.setData({ notFound: true, loading: false });
      return;
    }
    this.setData({ userId: Number(userId) });
    this.loadUserInfo();
    this.loadList();
  },

  async loadUserInfo() {
    try {
      const userInfo = await api.getUser(this.data.userId);
      this.setData({ userInfo });
      wx.setNavigationBarTitle({ title: userInfo.nickName + ' 的主页' });
    } catch (err) {
      this.setData({ notFound: true, loading: false });
    }
  },

  switchTab(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeTab) return;
    this.setData({ activeTab: key, list: [], page: 1, hasMore: true });
    this.loadList();
  },

  async loadList() {
    if (this.data.loading && this.data.page > 1) return;
    this.setData({ loading: true });
    const { userId, activeTab, page } = this.data;
    const params = { userId, page, pageSize: 20 };

    try {
      let result;
      if (activeTab === 'product') {
        result = await api.getProducts(params);
      } else if (activeTab === 'post') {
        result = await api.getPosts(params);
      } else if (activeTab === 'activity') {
        result = await api.getActivities(params);
      } else if (activeTab === 'help') {
        result = await api.getHelps(params);
      } else if (activeTab === 'carpool') {
        result = await api.getCarpools(params);
      } else if (activeTab === 'pet') {
        result = await api.getPets(params);
      } else if (activeTab === 'sam') {
        result = await api.getSams(params);
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

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, list: [], hasMore: true });
    Promise.all([this.loadUserInfo(), this.loadList()]).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  goDetail(e) {
    const { id, type } = e.currentTarget.dataset;
    const routes = {
      product: '/pages/detail/detail?id=',
      post: '/pages/forumDetail/forumDetail?id=',
      activity: '/pages/activityDetail/activityDetail?id=',
      pet: '/pages/petDetail/petDetail?id=',
      sam: '/pages/samDetail/samDetail?id='
    };
    const route = routes[type || this.data.activeTab];
    if (route) {
      wx.navigateTo({ url: route + id });
    }
  },

  onSendMessage() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      app.login();
      return;
    }
    const { userId } = this.data;
    const target = this.data.userInfo;
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + userId +
        '&nickName=' + encodeURIComponent(target.nickName) +
        '&avatarUrl=' + encodeURIComponent(target.avatarUrl || '')
    });
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  }
});
