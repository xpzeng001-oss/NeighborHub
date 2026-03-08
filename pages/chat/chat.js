const api = require('../../utils/api');

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr; // 已经是格式化文本
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
  if (diff < 172800000) return '昨天';
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
  return (d.getMonth() + 1) + '/' + d.getDate();
}

Page({
  data: {
    statusBarHeight: 44,
    conversations: [],
    totalUnread: 0,
    loading: true
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    this.loadConversations();
  },

  async loadConversations() {
    const token = wx.getStorageSync('token');
    if (!token) {
      this.setData({ conversations: [], totalUnread: 0, loading: false });
      return;
    }
    try {
      const list = await api.getConversations();
      const conversations = (list || []).map(c => ({ ...c, lastMessageAt: formatTimeAgo(c.lastMessageAt) }));
      this.setData({
        conversations,
        totalUnread: conversations.reduce((s, c) => s + (c.unreadCount || 0), 0),
        loading: false
      });
    } catch (err) {
      this.setData({ conversations: [], totalUnread: 0, loading: false });
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
  }
});
