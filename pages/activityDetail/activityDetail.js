// pages/activityDetail/activityDetail.js
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
    detail: null
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
    this.activityId = options.id;
    this.loadDetail();
  },

  goBack() {
    wx.navigateBack();
  },

  async loadDetail() {
    try {
      const data = await api.getActivityDetail(this.activityId);
      data.startTimeFormatted = formatActivityTime(data.startTime);
      data.endTimeFormatted = formatActivityTime(data.endTime);
      data.participantAvatars = data.participantAvatars || [];
      data.images = data.images || [];
      this.setData({ detail: data });
    } catch (e) {
      console.error('[activityDetail] load failed', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async onJoin() {
    const { detail } = this.data;
    if (!detail) return;
    if (detail.isOrganizer) return;
    if (detail.isJoined || detail.status !== 'open') return;

    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    // 已报名则取消
    if (detail.isJoined) {
      const confirmRes = await new Promise(resolve => {
        wx.showModal({ title: '取消报名', content: '确定要取消报名吗？', success: resolve });
      });
      if (!confirmRes.confirm) return;
      try {
        const result = await api.cancelActivity(this.activityId);
        wx.showToast({ title: '已取消报名', icon: 'success' });
        this.setData({
          'detail.isJoined': false,
          'detail.currentParticipants': result.currentParticipants,
          'detail.status': result.status
        });
      } catch (e) {
        console.error('[activityDetail] cancel failed', e);
      }
      return;
    }

    try {
      const result = await api.joinActivity(this.activityId);
      wx.showToast({ title: '报名成功！', icon: 'success' });
      this.setData({
        'detail.isJoined': true,
        'detail.currentParticipants': result.currentParticipants,
        'detail.status': result.status
      });
    } catch (e) {
      console.error('[activityDetail] join failed', e);
    }
  },

  onChat() {
    const { detail } = this.data;
    if (!detail) return;
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?userId=' + detail.userId + '&userName=' + detail.userName
    });
  },

  async onDelete() {
    const res = await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个活动吗？',
        success: resolve
      });
    });
    if (!res.confirm) return;

    try {
      await api.deleteActivity(this.activityId);
      wx.showToast({ title: '已删除', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      console.error('[activityDetail] delete failed', e);
    }
  },

  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: this.data.detail.images
    });
  },

  onShare() {
    // Trigger share
  },

  onShareAppMessage() {
    const { detail } = this.data;
    return {
      title: detail ? detail.title : '一起参加活动吧',
      path: '/pages/activityDetail/activityDetail?id=' + this.activityId
    };
  }
});
