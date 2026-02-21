// pages/index/index.js
const app = getApp();
const { mockProducts, mockBanners, categories } = require('../../utils/mockData');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    currentCommunity: '仁恒河滨花园',
    communities: [],
    showCommunityPicker: false,
    banners: [
      { id: 1, title: '邻里市集上线啦', desc: '闲置好物 邻里共享', iconName: 'sparkles', bg: '#E6A023' },
      { id: 2, title: '免费自取专区', desc: '好物不浪费 环保又省钱', iconName: 'gift', bg: '#D4930D' },
      { id: 3, title: '社区团购进行中', desc: '新鲜水果 产地直供', iconName: 'shopping-bag', bg: '#C8880D' }
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
    this.setData({
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
  loadProducts() {
    let products = [...mockProducts];
    const tab = this.data.activeTab;

    // 按tab筛选
    if (tab === 1) {
      products = products.filter(p => p.isFree);
    } else if (tab === 2) {
      products.sort((a, b) => b.createdAt - a.createdAt);
    } else if (tab === 3) {
      products.sort((a, b) => b.viewCount - a.viewCount);
    }

    // 按分类筛选
    if (this.data.activeCategory !== 'all') {
      const catMap = {
        'digital': '数码', 'furniture': '家具', 'appliance': '家电',
        'baby': '母婴', 'sports': '运动', 'clothing': '服饰',
        'books': '图书', 'tools': '工具'
      };
      const catName = catMap[this.data.activeCategory];
      if (catName) {
        products = products.filter(p => p.category === catName);
      }
    }

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
      hasMore: false
    });
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
  onRefresh() {
    this.setData({ isRefreshing: true });
    setTimeout(() => {
      this.loadProducts();
      this.setData({ isRefreshing: false });
      wx.showToast({ title: '刷新成功', icon: 'none' });
    }, 800);
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
  goFree() {
    this.setData({ activeTab: 1 });
    this.loadProducts();
  },

  onShareAppMessage() {
    return {
      title: '邻里市集 - 小区闲置好物交易',
      path: '/pages/index/index'
    };
  }
});
