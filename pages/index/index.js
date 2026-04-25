// pages/index/index.js
const app = getApp();
const api = require('../../utils/api');

const contentTypes = [
  { id: 'all', name: '全部', icon: 'squares-four', color: '#C67A52' },
  { id: 'product', name: '闲置物品', icon: 'clipboard', color: '#C67A52' },
  { id: 'free', name: '免费送', icon: 'gift', color: '#D49A78' },
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
    sortTabs: ['最新', '最热', '免费'],
    activeSort: 0,
    products: [],
    leftProducts: [],
    rightProducts: [],
    isRefreshing: false,
    hasMore: true,
    loadingMore: false,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const menuRect = wx.getMenuButtonBoundingClientRect();
    const community = app.globalData.currentCommunity;
    this.setData({
      statusBarHeight: menuRect.top,
      navHeight: menuRect.height,
      communities: app.globalData.communities,
      currentCommunity: (community && community.name) || '选择小区'
    });
    this.loadCommunities().then(() => {
      // 如果没有选过小区，默认选第一个
      if (!app.globalData.currentCommunity && app.globalData.communities.length > 0) {
        const first = app.globalData.communities[0];
        this._selectCommunityAndDistrict(first);
        this.setData({ currentCommunity: first.name });
      }
      this.loadProducts();
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    this.loadProducts();
  },

  // 加载商品数据
  async loadProducts(loadMore = false) {
    if (loadMore && (!this.data.hasMore || this.data.loadingMore)) return;
    if (loadMore) this.setData({ loadingMore: true });

    try {
      const pageSize = this.data.pageSize;
      const page = loadMore ? this.data.page + 1 : 1;
      const params = { page, pageSize };
      const type = this.data.activeType;
      const sort = this.data.activeSort;

      // 按当前社区过滤
      const district = app.globalData.currentDistrict;
      if (district && district.id) {
        params.districtId = district.id;
      }

      // 分类筛选
      if (type === 'free') params.isFree = '1';
      else if (type === 'product') params.isFree = '0';
      else if (type !== 'all') params.type = type;

      // 排序
      params.sort = sort === 0 ? 'new' : 'hot';

      const data = await api.getProducts(params);
      const newList = data.list || [];

      const products = loadMore ? this.data.products.concat(newList) : newList;

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
        page,
        hasMore: newList.length >= pageSize,
        loadingMore: false
      });
    } catch (err) {
      console.log('加载商品失败', err);
      this.setData({ loadingMore: false });
    }
  },

  // 上拉加载更多
  onLoadMore() {
    this.loadProducts(true);
  },

  // 图片加载完成：按真实宽高算高度，最高封顶 3:4 比例（高/宽 ≤ 4/3）
  onImgLoad(e) {
    const { col, idx } = e.currentTarget.dataset;
    const { width, height } = e.detail;
    if (!width || !height) return;
    const COL_W = 335; // rpx
    const ratio = Math.min(height / width, 4 / 3);
    const imgHeight = Math.round(COL_W * ratio);
    const key = col === 'left' ? 'leftProducts' : 'rightProducts';
    const list = this.data[key];
    if (!list[idx] || list[idx].imgHeight === imgHeight) return;
    this.setData({ [`${key}[${idx}].imgHeight`]: imgHeight });
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

  // 小区选择
  onCommunityTap() {
    this.setData({ showCommunityPicker: true });
  },
  closePicker() {
    this.setData({ showCommunityPicker: false });
  },
  selectCommunity(e) {
    const item = e.currentTarget.dataset.item;
    this._selectCommunityAndDistrict(item);
    this.setData({
      currentCommunity: item.name,
      showCommunityPicker: false
    });
    this.loadProducts();
    wx.showToast({ title: '已切换至' + item.name, icon: 'none' });
  },
  // 选小区时自动关联社区
  _selectCommunityAndDistrict(community) {
    app.globalData.currentCommunity = community;
    wx.setStorageSync('currentCommunity', community);
    // 从 districts 列表中找到该小区所属的社区
    const districts = app.globalData.districts || [];
    const parentDistrict = districts.find(d =>
      d.communities && d.communities.some(c => c.id === community.id)
    );
    if (parentDistrict) {
      app.globalData.currentDistrict = parentDistrict;
      wx.setStorageSync('currentDistrict', parentDistrict);
    }
  },
  goCommunityApply() {
    this.setData({ showCommunityPicker: false });
    wx.navigateTo({ url: '/pages/communityApply/communityApply' });
  },
  async loadCommunities() {
    try {
      // 加载社区列表（含小区映射）
      const districtData = await api.getDistricts();
      const districtList = districtData.list || [];
      if (districtList.length > 0) {
        app.globalData.districts = districtList;
      }
      // 加载小区列表
      const data = await api.getCommunities();
      const list = data.list || data;
      if (list && list.length > 0) {
        app.globalData.communities = list;
        this.setData({ communities: list });
      }
    } catch (err) {}
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
