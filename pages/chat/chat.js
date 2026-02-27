const api = require('../../utils/api');

Page({
  data: {
    conversations: [],
    loading: true
  },

  onShow() {
    this.loadConversations();
  },

  async loadConversations() {
    const token = wx.getStorageSync('token');
    if (!token) {
      this.setData({ loading: false });
      return;
    }
    try {
      const list = await api.getConversations();
      this.setData({ conversations: list || [], loading: false });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  goChat(e) {
    const { id, userId, nickName, avatarUrl } = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?conversationId=' + id +
        '&targetUserId=' + userId +
        '&nickName=' + encodeURIComponent(nickName) +
        '&avatarUrl=' + encodeURIComponent(avatarUrl)
    });
  },

  formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
    return (d.getMonth() + 1) + '/' + d.getDate();
  }
});
