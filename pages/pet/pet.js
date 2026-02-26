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
    wx.showToast({ title: '已发送私信', icon: 'none' });
  },

  onRespond(e) {
    wx.showToast({ title: '已报名，等待对方确认', icon: 'none' });
  },

  goPublish() {
    wx.showToast({ title: '发布宠物喂养需求', icon: 'none' });
  }
});
