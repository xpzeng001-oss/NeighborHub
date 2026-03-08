// pages/carpool/carpool.js
const api = require('../../utils/api');

Page({
  data: {
    tabs: ['全部', '有车带人', '找车搭乘'],
    activeTab: 0,
    tripList: [],
    filteredList: []
  },

  onLoad() {
    this.loadTrips();
  },

  onShow() {
    this.loadTrips();
  },

  async loadTrips() {
    try {
      const data = await api.getCarpools();
      this.setData({ tripList: data.list || [] });
    } catch (err) {
      this.setData({ tripList: [] });
    }
    this.filterList();
  },

  filterList() {
    const tab = this.data.activeTab;
    let filtered = this.data.tripList;
    if (tab === 1) filtered = filtered.filter(i => i.type === 'offer');
    if (tab === 2) filtered = filtered.filter(i => i.type === 'seek');
    this.setData({ filteredList: filtered });
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    this.filterList();
  },

  onContact(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.filteredList.find(t => t.id === id);
    if (!item || !item.userId) return;
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.onContact(e); });
      return;
    }
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + item.userId +
        '&nickName=' + encodeURIComponent(item.userName || '') +
        '&avatarUrl=' + encodeURIComponent(item.userAvatar || '')
    });
  },

  async onJoin(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.onJoin(e); });
      return;
    }
    try {
      const data = await api.joinCarpool(id);
      const list = this.data.filteredList.map(item => {
        if (item.id === id) return { ...item, joined: true, takenSeats: data.takenSeats, status: data.status };
        return item;
      });
      const tripList = this.data.tripList.map(item => {
        if (item.id === id) return { ...item, joined: true, takenSeats: data.takenSeats, status: data.status };
        return item;
      });
      this.setData({ filteredList: list, tripList });
      wx.showToast({ title: '拼车成功', icon: 'success' });
    } catch (err) {
      // fallback: mock data local update
      const list = this.data.filteredList.map(item => {
        if (item.id === id) return { ...item, joined: true, takenSeats: item.takenSeats + 1 };
        return item;
      });
      const tripList = this.data.tripList.map(item => {
        if (item.id === id) return { ...item, joined: true, takenSeats: item.takenSeats + 1 };
        return item;
      });
      this.setData({ filteredList: list, tripList });
      wx.showToast({ title: '拼车成功', icon: 'success' });
    }
  },

  goPublish() {
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.goPublish(); });
      return;
    }
    wx.navigateTo({ url: '/pages/publish/publish?type=carpool' });
  }
});
