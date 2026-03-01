Page({
  data: {
    statusBarHeight: 44,
    categories: [
      { id: 'forum', name: '楼里事儿', icon: 'message-circle', color: '#5B8C3E', tint: '#EFF6E8', count: 2, url: '/pages/forum/forum' },
      { id: 'help', name: '邻里帮忙', icon: 'handshake', color: '#4A90D9', tint: '#DAEAF6', count: 1, url: '/pages/help/help' },
      { id: 'rental', name: '房屋租赁', icon: 'home', color: '#E8883C', tint: '#FFE8D0', count: 1, url: '/pages/rental/rental' },
      { id: 'pet', name: '宠物喂养', icon: 'paw-print', color: '#D4A04A', tint: '#FFF3D0', count: 1, url: '/pages/pet/pet' },
      { id: 'sam', name: '山姆拼单', icon: 'shopping-cart', color: '#8B6DB0', tint: '#E8D5F0', count: 1, url: '/pages/sam/sam' },
      { id: 'carpool', name: '拼车顺路', icon: 'car', color: '#4A90D9', tint: '#DAEAF6', count: 5, url: '/pages/carpool/carpool' }
    ],
    stats: {
      activeUsers: '238',
      monthlyTrades: '1.2k',
      rating: '96%'
    }
  },

  onLoad() {
    const menuRect = wx.getMenuButtonBoundingClientRect();
    this.setData({ statusBarHeight: menuRect.top });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  goPage(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  }
});
