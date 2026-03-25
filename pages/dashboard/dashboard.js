// pages/dashboard/dashboard.js
const api = require('../../utils/api');

Page({
  data: {
    dashboard: null,
    contentBarList: []
  },

  onLoad() {
    this.loadDashboard();
  },

  async loadDashboard() {
    try {
      const data = await api.getAdminDashboard();

      // Calculate percentages for content bars
      const cb = data.contentBreakdown;
      const contentItems = [
        { label: '闲置', count: cb.product, color: '#C67A52' },
        { label: '帖子', count: cb.post, color: '#4A90D9' },
        { label: '互助', count: cb.help, color: '#E8883C' },
        { label: '租赁', count: cb.rental, color: '#D4A04A' },
        { label: '宠物', count: cb.pet, color: '#8B6DB0' },
        { label: '拼单', count: cb.sam, color: '#4A90D9' },
        { label: '拼车', count: cb.carpool, color: '#C67A52' }
      ];
      const maxContent = Math.max(...contentItems.map(i => i.count), 1);
      const contentBarList = contentItems.map(item => ({
        ...item,
        percent: Math.round((item.count / maxContent) * 100)
      }));

      // Calculate percentages for building distribution
      const maxBuilding = Math.max(...(data.usersByBuilding || []).map(b => Number(b.count)), 1);
      const usersByBuilding = (data.usersByBuilding || []).map(b => ({
        ...b,
        count: Number(b.count),
        percent: Math.round((Number(b.count) / maxBuilding) * 100)
      }));

      this.setData({
        dashboard: { ...data, usersByBuilding },
        contentBarList
      });
    } catch (e) {
      console.error('[Dashboard] 加载失败:', e);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    }
  }
});
