const api = require('../../utils/api');

const mockConversations = [
  {
    id: 1,
    targetUser: {
      id: 101,
      nickName: '张阿姨',
      avatarUrl: 'https://picsum.photos/200/200?random=11'
    },
    topic: '宜家书架 9成新',
    lastMessage: '好的，那周六下午来取可以吗？',
    lastMessageAt: '刚刚',
    unreadCount: 2
  },
  {
    id: 2,
    targetUser: {
      id: 102,
      nickName: '小李妈妈',
      avatarUrl: 'https://picsum.photos/200/200?random=12'
    },
    topic: '婴儿衣服 0-6月',
    lastMessage: '衣服还在的，你方便什么时候来拿？',
    lastMessageAt: '10分钟前',
    unreadCount: 1
  },
  {
    id: 3,
    targetUser: {
      id: 103,
      nickName: '花花',
      avatarUrl: 'https://picsum.photos/200/200?random=13'
    },
    topic: '多肉植物 自取',
    lastMessage: '谢谢你！多肉收到啦，很漂亮~',
    lastMessageAt: '昨天',
    unreadCount: 0
  },
  {
    id: 4,
    targetUser: {
      id: 104,
      nickName: '赵美丽',
      avatarUrl: 'https://picsum.photos/200/200?random=14'
    },
    topic: '山姆拼单',
    lastMessage: '还差一个人，你要加入吗？',
    lastMessageAt: '3小时前',
    unreadCount: 0
  },
  {
    id: 5,
    targetUser: {
      id: 105,
      nickName: '刘佳',
      avatarUrl: 'https://picsum.photos/200/200?random=15'
    },
    topic: '猫咪喂养',
    lastMessage: '猫粮已经放在门口了，谢谢！',
    lastMessageAt: '昨天',
    unreadCount: 0
  },
  {
    id: 6,
    targetUser: {
      id: 106,
      nickName: '陈阿姨',
      avatarUrl: 'https://picsum.photos/200/200?random=16'
    },
    topic: '烤箱 九成新',
    lastMessage: '那个烤箱50块钱可以吗？',
    lastMessageAt: '2天前',
    unreadCount: 0
  }
];

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
      this.setData({
        conversations: mockConversations,
        totalUnread: mockConversations.reduce((s, c) => s + c.unreadCount, 0),
        loading: false
      });
      return;
    }
    try {
      const list = await api.getConversations();
      const conversations = (list && list.length > 0)
        ? list.map(c => ({ ...c, lastMessageAt: formatTimeAgo(c.lastMessageAt) }))
        : mockConversations;
      this.setData({
        conversations,
        totalUnread: conversations.reduce((s, c) => s + (c.unreadCount || 0), 0),
        loading: false
      });
    } catch (err) {
      this.setData({
        conversations: mockConversations,
        totalUnread: mockConversations.reduce((s, c) => s + c.unreadCount, 0),
        loading: false
      });
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
