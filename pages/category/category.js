const api = require('../../utils/api');

const TABS = [
  { id: 'all', name: '全部' },
  { id: 'product', name: '闲置' },
  { id: 'post', name: '帖子' },
  { id: 'help', name: '互助' },
  { id: 'rental', name: '租赁' },
  { id: 'pet', name: '宠物' },
  { id: 'sam', name: '拼单' },
  { id: 'carpool', name: '拼车' }
];

const TYPE_LABELS = {
  product: '闲置', post: '帖子', help: '互助', rental: '租赁',
  pet: '宠物', sam: '拼单', carpool: '拼车'
};

const TYPE_COLORS = {
  product: '#C67A52', post: '#4A90D9', help: '#E8883C', rental: '#D4A04A',
  pet: '#8B6DB0', sam: '#4A90D9', carpool: '#C67A52'
};

const formatTime = d => {
  const df = Date.now() - d;
  if (df < 60000) return '刚刚';
  if (df < 3600000) return Math.floor(df / 60000) + '分钟前';
  if (df < 86400000) return Math.floor(df / 3600000) + '小时前';
  if (df < 604800000) return Math.floor(df / 86400000) + '天前';
  const m = d.getMonth() + 1, day = d.getDate();
  return (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
};

Page({
  data: {
    statusBarHeight: 44,
    tabs: TABS,
    activeTab: 'all',
    feedList: [],
    isRefreshing: false,
    hasMore: true,
    page: 1
  },

  onLoad() {
    const menuRect = wx.getMenuButtonBoundingClientRect();
    this.setData({ statusBarHeight: menuRect.top });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.loadFeed(true);
  },

  switchTab(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activeTab) return;
    this.setData({ activeTab: id, feedList: [], page: 1, hasMore: true });
    this.loadFeed(true);
  },

  async loadFeed(reset) {
    try {
      const app = getApp();
      const district = app.globalData.currentDistrict;
      const page = reset ? 1 : this.data.page;
      const params = { type: this.data.activeTab, page, pageSize: 20 };
      if (district && district.id) params.districtId = district.id;

      const data = await api.getFeed(params);
      const items = (data.list || []).map(item => ({
        ...item,
        typeLabel: TYPE_LABELS[item.feedType] || '',
        typeColor: TYPE_COLORS[item.feedType] || '#999',
        timeAgo: formatTime(new Date(item.createdAt))
      }));

      if (reset) {
        this.setData({ feedList: items, page: 2, hasMore: items.length >= 20 });
      } else {
        this.setData({
          feedList: this.data.feedList.concat(items),
          page: page + 1,
          hasMore: items.length >= 20
        });
      }
    } catch (e) {
      console.error('[plaza] load failed', e);
    }
  },

  async onRefresh() {
    this.setData({ isRefreshing: true });
    await this.loadFeed(true);
    this.setData({ isRefreshing: false });
  },

  onLoadMore() {
    if (this.data.hasMore) this.loadFeed(false);
  },

  onShareAppMessage() {
    return {
      title: '来邻里广场看看吧',
      path: '/pages/category/category'
    };
  },

  goDetail(e) {
    const { type, id } = e.currentTarget.dataset;
    const routes = {
      product: '/pages/detail/detail?id=',
      post: '/pages/forumDetail/forumDetail?id=',
      help: '/pages/help/help',
      rental: '/pages/rental/rental',
      pet: '/pages/petDetail/petDetail?id=',
      sam: '/pages/samDetail/samDetail?id=',
      carpool: '/pages/carpool/carpool'
    };
    const url = routes[type];
    if (!url) return;
    wx.navigateTo({ url: url.includes('?') ? url + id : url });
  }
});
