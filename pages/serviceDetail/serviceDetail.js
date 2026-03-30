const app = getApp();
const api = require('../../utils/api');

const typeNames = {
  housekeeping: '家政保洁', repair: '维修服务', tutoring: '家教辅导', other: '其它'
};

Page({
  data: { detail: null, typeName: '' },

  onLoad(options) {
    if (options.id) this.loadDetail(options.id);
  },

  async loadDetail(id) {
    try {
      const data = await api.getServiceDetail(id);
      this.setData({ detail: data, typeName: typeNames[data.type] || '本地服务' });
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
    wx.makePhoneCall({ phoneNumber: this.data.detail.contactPhone });
  },

  previewImage(e) {
    wx.previewImage({ current: e.currentTarget.dataset.src, urls: this.data.detail.images });
  },

  onShareAppMessage() {
    const d = this.data.detail;
    return { title: d ? d.title : '本地服务', path: '/pages/serviceDetail/serviceDetail?id=' + (d ? d.id : '') };
  }
});
