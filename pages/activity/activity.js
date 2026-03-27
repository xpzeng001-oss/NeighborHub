// pages/activity/activity.js
const api = require('../../utils/api');

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function formatActivityTime(timeStr) {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return timeStr;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = WEEKDAYS[d.getDay()];
  const h = ('0' + d.getHours()).slice(-2);
  const m = ('0' + d.getMinutes()).slice(-2);
  return month + '月' + day + '日 ' + weekday + ' ' + h + ':' + m;
}

Page({
  data: {
    statusBarHeight: 44,
    tabs: ['全部', '报名中', '已结束'],
    activeTab: 0,
    list: [],
    filteredList: [],
    isRefreshing: false,
    hasMore: true,
    page: 1
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
  },

  onShow() {
    this.loadList(true);
  },

  goBack() {
    wx.navigateBack();
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    if (index === this.data.activeTab) return;
    this.setData({ activeTab: index });
    this.filterList();
  },

  filterList() {
    const { list, activeTab } = this.data;
    let filtered;
    if (activeTab === 0) {
      filtered = list;
    } else if (activeTab === 1) {
      filtered = list.filter(item => item.status === 'open');
    } else {
      filtered = list.filter(item => item.status !== 'open');
    }
    this.setData({ filteredList: filtered });
  },

  async loadList(reset) {
    try {
      const app = getApp();
      const district = app.globalData.currentDistrict;
      const page = reset ? 1 : this.data.page;
      const params = { page, pageSize: 20 };
      if (district && district.id) params.districtId = district.id;

      const data = await api.getActivities(params);
      const items = (data.list || []).map(item => ({
        ...item,
        startTimeFormatted: formatActivityTime(item.startTime),
        endTimeFormatted: formatActivityTime(item.endTime),
        participantAvatars: item.participantAvatars || []
      }));

      if (reset) {
        this.setData({ list: items, page: 2, hasMore: items.length >= 20 });
      } else {
        this.setData({
          list: this.data.list.concat(items),
          page: page + 1,
          hasMore: items.length >= 20
        });
      }
      this.filterList();
    } catch (e) {
      console.error('[activity] load failed', e);
    }
  },

  async onRefresh() {
    this.setData({ isRefreshing: true });
    await this.loadList(true);
    this.setData({ isRefreshing: false });
  },

  onLoadMore() {
    if (this.data.hasMore) this.loadList(false);
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/activityDetail/activityDetail?id=' + id });
  },

  onJoin(e) {
    const id = e.currentTarget.dataset.id;
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/activityDetail/activityDetail?id=' + id });
  },

  goPublish() {
    wx.navigateTo({ url: '/pages/publish/publish?type=activity' });
  },

  onShareAppMessage() {
    return {
      title: '一起参加活动吧',
      path: '/pages/index/index'
    };
  }
});
