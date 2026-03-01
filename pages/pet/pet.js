// pages/pet/pet.js
const api = require('../../utils/api');

Page({
  data: {
    tabs: ['全部', '寻求喂养', '可以帮喂', '宠物社交'],
    activeTab: 0,
    petList: [],
    filteredList: []
  },

  onLoad() {
    this.loadPets();
  },

  onShow() {
    this.loadPets();
  },

  async loadPets() {
    try {
      const typeMap = { 1: 'need', 2: 'offer', 3: 'social' };
      const params = {};
      if (this.data.activeTab > 0) {
        params.type = typeMap[this.data.activeTab];
      }
      const data = await api.getPets(params);
      const list = data.list || [];
      this.setData({ petList: list, filteredList: list });
    } catch (err) {
      console.log('加载宠物列表失败', err);
    }
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    this.loadPets();
  },

  onContact(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.filteredList.find(p => p.id === id);
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

  async onRespond(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.onRespond(e); });
      return;
    }
    try {
      const data = await api.respondPet(id);
      const list = this.data.filteredList.map(item => {
        if (item.id === id) return { ...item, responseCount: data.responseCount };
        return item;
      });
      this.setData({ filteredList: list });
      wx.showToast({ title: '已报名，等待对方确认', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '报名失败', icon: 'none' });
    }
  },

  goPublish() {
    wx.navigateTo({ url: '/pages/publish/publish?type=pet' });
  }
});
