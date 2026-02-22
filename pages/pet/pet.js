Page({
  data: {
    tabs: ['全部', '寻求喂养', '可以帮喂', '宠物社交'],
    activeTab: 0,
    petList: [
      {
        id: 'p001',
        type: 'need',
        userName: '张小花',
        userAvatar: '/images/avatar-placeholder.png',
        building: '3栋1602',
        petName: '奶茶',
        petType: '英短猫',
        title: '出差5天，求邻居帮忙喂猫',
        description: '家里一只英短，很乖不咬人。需要每天来喂一次猫粮换水，铲一次猫砂。猫粮猫砂都备好了，可以提供报酬~',
        dateRange: '3月1日 - 3月5日',
        reward: '50元/天',
        tags: ['已绝育', '性格温顺'],
        status: 'open',
        responseCount: 3,
        createdAt: '2小时前'
      },
      {
        id: 'p002',
        type: 'offer',
        userName: '李大宝',
        userAvatar: '/images/avatar-placeholder.png',
        building: '5栋801',
        title: '周末可以帮忙遛狗/喂猫',
        description: '本人很喜欢小动物，家里也养了一只金毛。周末时间充裕，可以帮邻居们遛狗、喂猫，上门喂食都可以。有养宠经验，靠谱负责！',
        availableTime: '每周六日',
        priceRange: '面议',
        tags: ['有养宠经验', '可上门'],
        status: 'open',
        responseCount: 8,
        createdAt: '5小时前'
      },
      {
        id: 'p003',
        type: 'need',
        userName: '王美丽',
        userAvatar: '/images/avatar-placeholder.png',
        building: '1栋2203',
        petName: '豆豆',
        petType: '柯基犬',
        title: '每天下午帮遛狗30分钟',
        description: '最近腿受伤了不方便出门，家里柯基需要每天下午遛一次，大概30分钟。豆豆很友好，不会攻击人，就是有点贪吃。',
        dateRange: '即日起 - 3月15日',
        reward: '30元/次',
        tags: ['已打疫苗', '牵绳即可'],
        status: 'open',
        responseCount: 5,
        createdAt: '昨天'
      },
      {
        id: 'p004',
        type: 'social',
        userName: '赵小宝',
        userAvatar: '/images/avatar-placeholder.png',
        building: '7栋501',
        title: '周末小区花园宠物聚会🐾',
        description: '各位铲屎官们，本周六下午3点在小区中心花园搞一个宠物聚会！带上你家毛孩子一起来玩耍吧～可以互相交流养宠心得，也让毛孩子们交交朋友。',
        eventTime: '本周六 15:00',
        location: '小区中心花园',
        tags: ['宠物聚会', '自由参加'],
        status: 'open',
        responseCount: 12,
        createdAt: '3小时前'
      },
      {
        id: 'p005',
        type: 'need',
        userName: '陈先生',
        userAvatar: '/images/avatar-placeholder.png',
        building: '2栋1801',
        petName: '团团&圆圆',
        petType: '两只布偶猫',
        title: '春节回老家，求猫咪寄养7天',
        description: '两只布偶猫，都做了绝育和疫苗。很亲人，不怕生。希望找一个有养猫经验的邻居帮忙照顾，猫粮、猫砂、零食都会准备好。',
        dateRange: '2月26日 - 3月4日',
        reward: '80元/天（两只）',
        tags: ['已绝育', '已打疫苗', '两只猫'],
        status: 'open',
        responseCount: 2,
        createdAt: '1天前'
      }
    ],
    filteredList: []
  },

  onLoad() {
    this.filterList();
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    this.filterList();
  },

  filterList() {
    const tab = this.data.activeTab;
    let list = this.data.petList;
    if (tab === 1) list = list.filter(i => i.type === 'need');
    else if (tab === 2) list = list.filter(i => i.type === 'offer');
    else if (tab === 3) list = list.filter(i => i.type === 'social');
    this.setData({ filteredList: list });
  },

  onContact(e) {
    wx.showToast({ title: '已发送私信', icon: 'none' });
  },

  onRespond(e) {
    wx.showToast({ title: '已报名，等待对方确认', icon: 'none' });
  },

  goPublish() {
    wx.showToast({ title: '发布宠物喂养需求', icon: 'none' });
  }
});
