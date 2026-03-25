// pages/dashboard/dashboard.js
const api = require('../../utils/api');

const PERIOD_LABELS = { all: '总', today: '今日', week: '本周', month: '本月' };

Page({
  data: {
    period: 'all',
    periodLabel: '总',
    dashboard: null,
    contentBarList: []
  },

  onLoad() {
    this.loadDashboard();
  },

  switchPeriod(e) {
    const period = e.currentTarget.dataset.period;
    if (period === this.data.period) return;
    this.setData({ period, periodLabel: PERIOD_LABELS[period], dashboard: null });
    this.loadDashboard();
  },

  async loadDashboard() {
    try {
      const data = await api.getAdminDashboard({ period: this.data.period });

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

      const usersByCommunity = (data.usersByCommunity || []).map(c => {
        const maxB = Math.max(...c.buildings.map(b => b.count), 1);
        return {
          ...c,
          buildings: c.buildings.map(b => ({
            ...b,
            percent: Math.round((b.count / maxB) * 100)
          }))
        };
      });

      this.setData({
        dashboard: { ...data, usersByCommunity },
        contentBarList
      });
    } catch (e) {
      console.error('[Dashboard] 加载失败:', e);
      wx.showToast({ title: '数据加载失败', icon: 'none' });
    }
  }
});
