const app = getApp();
const api = require('../../utils/api');
const { callWithMask } = require('../../utils/phone');

Page({
  data: {
    detail: null,
    isOwner: false
  },

  onLoad(options) {
    if (options.id) this.loadDetail(options.id);
  },

  async loadDetail(id) {
    try {
      const data = await api.getCarpoolDetail(id);
      const userInfo = app.globalData.userInfo;
      this.setData({
        detail: data,
        isOwner: userInfo && data.userId === userInfo.id
      });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  goUserProfile() {
    const d = this.data.detail;
    if (!d) return;
    if (app.globalData.userInfo && d.userId === app.globalData.userInfo.id) {
      wx.switchTab({ url: '/pages/mine/mine' });
    } else {
      wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + d.userId });
    }
  },

  onContact() {
    const token = wx.getStorageSync('token');
    if (!token) { wx.showToast({ title: '请先登录', icon: 'none' }); return; }
    const d = this.data.detail;
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + d.userId +
        '&nickName=' + encodeURIComponent(d.userName || '') +
        '&avatarUrl=' + encodeURIComponent(d.userAvatar || '')
    });
  },

  onCopyWechat() {
    wx.setClipboardData({
      data: this.data.detail.contactWechat,
      success: () => wx.showToast({ title: '微信号已复制，去微信添加好友', icon: 'none' })
    });
  },

  onCallPhone() {
    callWithMask(this.data.detail.contactPhone);
  },

  async onJoin() {
    const token = wx.getStorageSync('token');
    if (!token) { wx.showToast({ title: '请先登录', icon: 'none' }); return; }
    const d = this.data.detail;
    if (d.status !== 'open') return;
    try {
      const res = await api.joinCarpool(d.id);
      this.setData({
        'detail.takenSeats': res.takenSeats,
        'detail.status': res.status
      });
      wx.showToast({ title: '加入成功', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: e.message || '加入失败', icon: 'none' });
    }
  },

  onShareAppMessage() {
    const d = this.data.detail;
    return {
      title: d ? d.title : '拼车顺路',
      path: '/pages/carpoolDetail/carpoolDetail?id=' + (d ? d.id : '')
    };
  }
});
