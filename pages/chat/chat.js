const api = require('../../utils/api');

// 假数据 —— 用于预览样式
const mockConversations = [
  {
    id: 1,
    targetUser: {
      id: 101,
      nickName: '张小明',
      avatarUrl: 'https://picsum.photos/200/200?random=11'
    },
    lastMessage: '那个书桌还在吗？想看看实物',
    lastMessageAt: '刚刚',
    unreadCount: 3
  },
  {
    id: 2,
    targetUser: {
      id: 102,
      nickName: '李婷婷',
      avatarUrl: 'https://picsum.photos/200/200?random=12'
    },
    lastMessage: '好的，明天下午3点楼下见~',
    lastMessageAt: '10分钟前',
    unreadCount: 1
  },
  {
    id: 3,
    targetUser: {
      id: 103,
      nickName: '王大哥',
      avatarUrl: 'https://picsum.photos/200/200?random=13'
    },
    lastMessage: '已经帮你浇好水了，放心吧',
    lastMessageAt: '1小时前',
    unreadCount: 0
  },
  {
    id: 4,
    targetUser: {
      id: 104,
      nickName: '赵美丽',
      avatarUrl: 'https://picsum.photos/200/200?random=14'
    },
    lastMessage: '山姆拼单还差一个人，你要加入吗？',
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
    lastMessage: '那个烤箱50块钱可以吗？',
    lastMessageAt: '昨天',
    unreadCount: 0
  },
  {
    id: 7,
    targetUser: {
      id: 107,
      nickName: '周杰',
      avatarUrl: 'https://picsum.photos/200/200?random=17'
    },
    lastMessage: '收到，我晚上去拿',
    lastMessageAt: '2天前',
    unreadCount: 0
  }
];

Page({
  data: {
    conversations: [],
    loading: true
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.loadConversations();
  },

  async loadConversations() {
    const token = wx.getStorageSync('token');
    if (!token) {
      // 未登录时展示假数据，方便预览样式
      this.setData({ conversations: mockConversations, loading: false });
      return;
    }
    try {
      const list = await api.getConversations();
      const conversations = (list && list.length > 0) ? list : mockConversations;
      this.setData({ conversations, loading: false });
    } catch (err) {
      this.setData({ conversations: mockConversations, loading: false });
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
