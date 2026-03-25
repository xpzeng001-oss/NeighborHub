const api = require('../../utils/api');

Page({
  data: {
    statusBarHeight: 44,
    categories: [
      { id: 'forum', name: '楼里事儿', icon: 'message-circle', color: '#C67A52', tint: '#F3E8DA', count: 0, url: '/pages/forum/forum' },
      { id: 'help', name: '邻里帮忙', icon: 'handshake', color: '#4A90D9', tint: '#DAEAF6', count: 0, url: '/pages/help/help' },
      { id: 'rental', name: '房屋租赁', icon: 'home', color: '#E8883C', tint: '#FFE8D0', count: 0, url: '/pages/rental/rental' },
      { id: 'pet', name: '宠物喂养', icon: 'paw-print', color: '#D4A04A', tint: '#FFF3D0', count: 0, url: '/pages/pet/pet' },
      { id: 'sam', name: '山姆拼单', icon: 'shopping-cart', color: '#8B6DB0', tint: '#E8D5F0', count: 0, url: '/pages/sam/sam' },
      { id: 'carpool', name: '拼车顺路', icon: 'car', color: '#4A90D9', tint: '#DAEAF6', count: 0, url: '/pages/carpool/carpool' }
    ],
  },

  onLoad() {
    const menuRect = wx.getMenuButtonBoundingClientRect();
    this.setData({ statusBarHeight: menuRect.top });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.loadCounts();
  },

  async loadCounts() {
    try {
      const app = getApp();
      const district = app.globalData.currentDistrict;
      const params = {};
      if (district && district.id) params.districtId = district.id;
      const counts = await api.getCategoryCounts(params);
      const categories = this.data.categories.map(cat => ({
        ...cat,
        count: counts[cat.id] || 0
      }));
      this.setData({ categories });
    } catch (e) {
      // 加载失败保持当前数量
    }
  },

  goPage(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  }
});
