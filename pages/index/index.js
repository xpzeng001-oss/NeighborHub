// pages/index/index.js
const app = getApp();
const api = require('../../utils/api');

const contentTypes = [
  { id: 'all', name: '全部', icon: 'squares-four', color: '#5B8C3E' },
  { id: 'product', name: '闲置物品', icon: 'clipboard', color: '#5B8C3E' },
  { id: 'free', name: '免费送', icon: 'gift', color: '#E8883C' },
  { id: 'new', name: '最新发布', icon: 'clock', color: '#4A90D9' }
];

Page({
  data: {
    statusBarHeight: 44,
    navHeight: 32,
    currentCommunity: '仁恒峦山美地',
    communities: [],
    showCommunityPicker: false,
    contentTypes: contentTypes,
    activeType: 'all',
    sortTabs: ['最新', '热门'],
    activeSort: 0,
    products: [],
    leftProducts: [],
    rightProducts: [],
    isRefreshing: false,
    hasMore: true,
    page: 1
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuRect = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: menuRect.top,
      navHeight: menuRect.height,
      communities: app.globalData.communities,
      currentCommunity: app.globalData.currentCommunity.name
    });
    this.loadProducts();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  // 加载商品数据
  async loadProducts() {
    try {
      const params = { page: 1, pageSize: 20 };
      const type = this.data.activeType;
      const sort = this.data.activeSort;

      // 分类筛选
      if (type === 'free') params.isFree = '1';
      else if (type === 'product') params.category = 'product';
      else if (type !== 'all') params.type = type;

      // 排序
      params.sort = sort === 0 ? 'new' : 'hot';

      const data = await api.getProducts(params);
      const products = data.list || [];

      // 分配瀑布流左右列
      const left = [], right = [];
      products.forEach((item, index) => {
        if (index % 2 === 0) left.push(item);
        else right.push(item);
      });

      this.setData({
        products,
        leftProducts: left,
        rightProducts: right,
        hasMore: products.length >= 20
      });
    } catch (err) {
      console.log('加载商品失败', err);
    }
  },

  // 分类切换
  onTypeChange(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeType: id });
    this.loadProducts();
  },

  // 排序切换
  onSortChange(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeSort: index });
    this.loadProducts();
  },

  // 下拉刷新
  async onRefresh() {
    this.setData({ isRefreshing: true });
    await this.loadProducts();
    this.setData({ isRefreshing: false });
    wx.showToast({ title: '刷新成功', icon: 'none' });
  },

  // 公告点击
  // 小区选择
  onCommunityTap() {
    this.setData({ showCommunityPicker: true });
  },
  closePicker() {
    this.setData({ showCommunityPicker: false });
  },
  selectCommunity(e) {
    const item = e.currentTarget.dataset.item;
    app.globalData.currentCommunity = item;
    this.setData({
      currentCommunity: item.name,
      showCommunityPicker: false
    });
    this.loadProducts();
    wx.showToast({ title: '已切换至' + item.name, icon: 'none' });
  },

  // 导航
  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },

  onShareAppMessage() {
    return {
      title: '邻里互助 - 社区闲置好物交易',
      path: '/pages/index/index'
    };
  }
});
