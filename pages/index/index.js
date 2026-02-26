// pages/index/index.js
const app = getApp();
const api = require('../../utils/api');

const categories = [
  { id: 'all', name: '全部' },
  { id: 'digital', name: '数码' },
  { id: 'furniture', name: '家具' },
  { id: 'appliance', name: '家电' },
  { id: 'baby', name: '母婴' },
  { id: 'sports', name: '运动' },
  { id: 'clothing', name: '服饰' },
  { id: 'books', name: '图书' },
  { id: 'tools', name: '工具' },
  { id: 'other', name: '其他' }
];

const catMap = {
  'digital': '数码', 'furniture': '家具', 'appliance': '家电',
  'baby': '母婴', 'sports': '运动', 'clothing': '服饰',
  'books': '图书', 'tools': '工具', 'other': '其他'
};

Page({
  data: {
    statusBarHeight: 44,
    currentCommunity: '仁恒峦山美地',
    communities: [],
    showCommunityPicker: false,
    banners: [
      { id: 1, image: '/images/banner-01.png' },
      { id: 2, image: '/images/banner-02.png' }
    ],
    categories: categories,
    activeCategory: 'all',
    tabs: ['闲置物品', '免费自取', '最新发布', '热门'],
    activeTab: 0,
    products: [],
    leftProducts: [],
    rightProducts: [],
    isRefreshing: false,
    hasMore: true,
    page: 1
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight,
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
      const tab = this.data.activeTab;

      // Tab 筛选
      if (tab === 1) params.isFree = '1';
      if (tab === 2) params.sort = 'new';
      if (tab === 3) params.sort = 'hot';

      // 分类筛选
      if (this.data.activeCategory !== 'all') {
        params.category = catMap[this.data.activeCategory] || '';
      }

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

  // Tab切换
  onTabChange(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    this.loadProducts();
  },

  // 分类切换
  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeCategory: id });
    this.loadProducts();
  },

  // 下拉刷新
  async onRefresh() {
    this.setData({ isRefreshing: true });
    await this.loadProducts();
    this.setData({ isRefreshing: false });
    wx.showToast({ title: '刷新成功', icon: 'none' });
  },

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
  goForum() {
    wx.navigateTo({ url: '/pages/forum/forum' });
  },
  goHelp() {
    wx.navigateTo({ url: '/pages/help/help' });
  },
  goRental() {
    wx.navigateTo({ url: '/pages/rental/rental' });
  },
  goPet() {
    wx.navigateTo({ url: '/pages/pet/pet' });
  },
  goSam() {
    wx.navigateTo({ url: '/pages/sam/sam' });
  },

  onShareAppMessage() {
    return {
      title: '邻里市集 - 小区闲置好物交易',
      path: '/pages/index/index'
    };
  }
});
