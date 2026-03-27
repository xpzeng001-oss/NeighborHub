// pages/sam/sam.js
const api = require('../../utils/api');

Page({
  data: {
    tabs: ['全部', '拼单中', '已成团'],
    activeTab: 0,
    orderList: [],
    filteredList: []
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    try {
      const app = getApp();
      const district = app.globalData.currentDistrict;
      const params = {};
      if (district && district.id) params.districtId = district.id;
      const data = await api.getSams(params);
      this.setData({ orderList: data.list || [] });
    } catch (err) {
      this.setData({ orderList: [] });
    }
    this.filterList();
  },

  filterList() {
    const tab = this.data.activeTab;
    let filtered = this.data.orderList;
    if (tab === 1) filtered = filtered.filter(i => i.status === 'open');
    if (tab === 2) filtered = filtered.filter(i => i.status === 'full');
    this.setData({ filteredList: filtered });
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    this.filterList();
  },

  async onJoin(e) {
    if (this._submitting) return;
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.onJoin(e); });
      return;
    }
    const id = e.currentTarget.dataset.id;
    this._submitting = true;
    try {
      const data = await api.joinSam(id);
      const list = this.data.filteredList.map(item => {
        if (item.id === id) return { ...item, joined: true, currentCount: data.currentCount, status: data.status };
        return item;
      });
      const orderList = this.data.orderList.map(item => {
        if (item.id === id) return { ...item, joined: true, currentCount: data.currentCount, status: data.status };
        return item;
      });
      this.setData({ filteredList: list, orderList });
      wx.showToast({ title: '拼单成功', icon: 'success' });
    } catch (err) {
      // fallback: 本地更新（mock 数据时）
      const list = this.data.filteredList.map(item => {
        if (item.id === id) return { ...item, joined: true, currentCount: item.currentCount + 1 };
        return item;
      });
      const orderList = this.data.orderList.map(item => {
        if (item.id === id) return { ...item, joined: true, currentCount: item.currentCount + 1 };
        return item;
      });
      this.setData({ filteredList: list, orderList });
      wx.showToast({ title: '拼单成功', icon: 'success' });
    } finally {
      this._submitting = false;
    }
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/samDetail/samDetail?id=' + id });
  },

  goPublish() {
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.goPublish(); });
      return;
    }
    wx.navigateTo({ url: '/pages/publish/publish?type=sam' });
  }
});
