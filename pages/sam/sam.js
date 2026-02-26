// pages/sam/sam.js
const app = getApp();

const mockOrders = [
  {
    id: 1,
    userId: 1,
    userName: '张妈妈',
    userAvatar: 'https://picsum.photos/seed/sam1/100/100',
    building: '3栋',
    title: '本周六山姆拼单，满¥299包邮',
    description: '准备这周六去山姆采购，有需要的邻居可以一起拼单，主要买日用品和零食。清单可以群里商量。',
    deadline: '本周五 18:00',
    pickupMethod: '送货上门（3栋大堂）',
    minAmount: 50,
    targetCount: 8,
    currentCount: 5,
    participants: [
      'https://picsum.photos/seed/p1/50/50',
      'https://picsum.photos/seed/p2/50/50',
      'https://picsum.photos/seed/p3/50/50'
    ],
    status: 'open',
    createdAt: '2小时前'
  },
  {
    id: 2,
    userId: 2,
    userName: '李叔叔',
    userAvatar: 'https://picsum.photos/seed/sam2/100/100',
    building: '6栋',
    title: '山姆牛排拼团，A5和牛特价',
    description: '山姆APP上A5和牛在做活动，原价¥398/kg，活动价¥268/kg。有需要的邻居跟团，满5人下单。',
    deadline: '明天 12:00',
    pickupMethod: '自提（6栋门口）',
    minAmount: 100,
    targetCount: 5,
    currentCount: 5,
    participants: [
      'https://picsum.photos/seed/p4/50/50',
      'https://picsum.photos/seed/p5/50/50',
      'https://picsum.photos/seed/p6/50/50',
      'https://picsum.photos/seed/p7/50/50'
    ],
    status: 'full',
    createdAt: '5小时前'
  },
  {
    id: 3,
    userId: 3,
    userName: '王姐',
    userAvatar: 'https://picsum.photos/seed/sam3/100/100',
    building: '1栋',
    title: '周日山姆日用品拼单',
    description: '周日计划去山姆，纸巾、洗衣液、零食等日用品都可以拼，帮跑腿费每单¥5。',
    deadline: '周六 20:00',
    pickupMethod: '送货上门',
    minAmount: 30,
    targetCount: 10,
    currentCount: 3,
    participants: [
      'https://picsum.photos/seed/p8/50/50',
      'https://picsum.photos/seed/p9/50/50'
    ],
    status: 'open',
    createdAt: '昨天'
  }
];

Page({
  data: {
    tabs: ['全部', '拼单中', '已成团'],
    activeTab: 0,
    orderList: [],
    filteredList: []
  },

  onLoad() {
    this.loadOrders();
  },

  loadOrders() {
    const list = mockOrders;
    this.setData({ orderList: list });
    this.filterList();
  },

  filterList() {
    const tab = this.data.activeTab;
    let filtered = this.data.orderList;
    if (tab === 1) filtered = filtered.filter(i => i.status === 'open');
    if (tab === 2) filtered = filtered.filter(i => i.status === 'full');
    this.setData({ filteredList: filtered });
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    this.filterList();
  },

  onJoin(e) {
    if (!app.globalData.userInfo) {
      app.login(() => {
        wx.showToast({ title: '已报名拼单', icon: 'success' });
      });
      return;
    }
    wx.showToast({ title: '已报名拼单', icon: 'success' });
  },

  goPublish() {
    wx.showToast({ title: '发起拼单（开发中）', icon: 'none' });
  }
});
