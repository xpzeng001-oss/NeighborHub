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

const TYPE_LABELS = {
  product: '闲置', post: '论坛', help: '互助',
  pet: '宠物', sam: '拼单', carpool: '拼车', rental: '租赁'
};

const PUBLISH_TABS = [
  { key: 'product', name: '闲置' },
  { key: 'posts', name: '帖子' },
  { key: 'offshelf', name: '已下架' },
  { key: 'sold', name: '已卖出' }
];

const ACTIVITY_TABS = [
  { key: 'help', name: '帮忙' },
  { key: 'sam', name: '拼单' },
  { key: 'carpool', name: '拼车' },
  { key: 'pet', name: '宠物' },
  { key: 'activity', name: '活动' }
];

Page({
  data: {
    type: '',
    subType: 'help',
    publishTab: 'product',
    publishTabs: PUBLISH_TABS,
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

  switchPublishTab(e) {
    const tab = e.currentTarget.dataset.key;
    if (tab === this.data.publishTab) return;
    this.setData({ publishTab: tab, list: [], page: 1, hasMore: true });
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
        if (this.data.publishTab === 'product') {
          // 闲置 tab（排除已下架）
          const products = await api.getProducts({ userId: userInfo.id }).catch(() => ({ list: [] }));
          const list = (products.list || []).filter(item => item.status !== 'off').map(item => ({ ...item, _type: 'product', _typeLabel: TYPE_LABELS.product }));
          this.setData({ list, hasMore: false, loading: false });
        } else if (this.data.publishTab === 'offshelf') {
          // 已下架 tab
          const products = await api.getProducts({ userId: userInfo.id }).catch(() => ({ list: [] }));
          const list = (products.list || []).filter(item => item.status === 'off').map(item => ({ ...item, _type: 'product', _typeLabel: TYPE_LABELS.product }));
          this.setData({ list, hasMore: false, loading: false });
        } else if (this.data.publishTab === 'sold') {
          // 已卖出 tab
          const products = await api.getProducts({ userId: userInfo.id }).catch(() => ({ list: [] }));
          const list = (products.list || []).filter(item => item.status === 'sold').map(item => ({ ...item, _type: 'product', _typeLabel: TYPE_LABELS.product }));
          this.setData({ list, hasMore: false, loading: false });
        } else {
          // 帖子 tab（论坛、互助、宠物、拼单、拼车）
          const [posts, helps, pets, sams, carpools] = await Promise.all([
            api.getPosts({ userId: userInfo.id }).catch(() => ({ list: [] })),
            api.getHelps({ userId: userInfo.id }).catch(() => ({ list: [] })),
            api.getPets({ userId: userInfo.id }).catch(() => ({ list: [] })),
            api.getSams({ userId: userInfo.id }).catch(() => ({ list: [] })),
            api.getCarpools({ userId: userInfo.id }).catch(() => ({ list: [] }))
          ]);
          const allItems = [];
          (posts.list || []).forEach(item => allItems.push({ ...item, _type: 'post', _typeLabel: TYPE_LABELS.post, title: item.title || item.content }));
          (helps.list || []).forEach(item => allItems.push({ ...item, _type: 'help', _typeLabel: TYPE_LABELS.help }));
          (pets.list || []).forEach(item => allItems.push({ ...item, _type: 'pet', _typeLabel: TYPE_LABELS.pet }));
          (sams.list || []).forEach(item => allItems.push({ ...item, _type: 'sam', _typeLabel: TYPE_LABELS.sam }));
          (carpools.list || []).forEach(item => allItems.push({ ...item, _type: 'carpool', _typeLabel: TYPE_LABELS.carpool }));
          allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          this.setData({ list: allItems, hasMore: false, loading: false });
        }
        return;
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
      } else if (actualType === 'activity') {
        result = await api.getActivities({ userId: userInfo.id, page, pageSize: 20 });
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
    const { id, type } = e.currentTarget.dataset;
    const actualType = type || (this.data.type === 'activity' ? this.data.subType : this.data.type);
    if (actualType === 'help') return;
    if (actualType === 'sam') {
      wx.navigateTo({ url: '/pages/samDetail/samDetail?id=' + id });
    } else if (actualType === 'pet') {
      wx.navigateTo({ url: '/pages/petDetail/petDetail?id=' + id });
    } else if (actualType === 'post') {
      wx.navigateTo({ url: '/pages/forumDetail/forumDetail?id=' + id });
    } else if (actualType === 'activity') {
      wx.navigateTo({ url: '/pages/activityDetail/activityDetail?id=' + id });
    } else {
      wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
    }
  },

  // 闲置商品：下架
  offShelfProduct(e) {
    const { id, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认下架',
      content: '下架后买家将看不到该商品，你可以随时重新上架。',
      confirmColor: '#C67A52',
      confirmText: '下架',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' });
            await api.deleteProduct(id);
            wx.hideLoading();
            wx.showToast({ title: '已下架', icon: 'success' });
            const key = 'list[' + index + '].status';
            this.setData({ [key]: 'off' });
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 闲置商品：标记已卖出
  markSoldProduct(e) {
    const { id, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认已卖出',
      content: '标记已卖出后将无法重新上架。',
      confirmColor: '#C67A52',
      confirmText: '确认',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' });
            await api.markProductSold(id);
            wx.hideLoading();
            wx.showToast({ title: '已标记卖出', icon: 'success' });
            const key = 'list[' + index + '].status';
            this.setData({ [key]: 'sold' });
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 闲置商品：重新上架
  relistProduct(e) {
    const { id, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认上架',
      content: '上架后买家可以看到该商品。',
      confirmColor: '#4CAF50',
      confirmText: '上架',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' });
            await api.relistProduct(id);
            wx.hideLoading();
            wx.showToast({ title: '已上架', icon: 'success' });
            const key = 'list[' + index + '].status';
            this.setData({ [key]: 'selling' });
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 非闲置内容：删除
  deleteItem(e) {
    const { id, type, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确认删除？',
      confirmColor: '#E8636F',
      confirmText: '删除',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' });
            if (type === 'post') await api.deletePost(id);
            else if (type === 'help') await api.deleteHelp(id);
            else if (type === 'pet') await api.deletePet(id);
            else if (type === 'sam') await api.deleteSam(id);
            else if (type === 'carpool') await api.deleteCarpool(id);
            else if (type === 'rental') await api.deleteRental(id);
            wx.hideLoading();
            wx.showToast({ title: '已删除', icon: 'success' });
            const list = this.data.list.filter((_, i) => i !== index);
            this.setData({ list });
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
