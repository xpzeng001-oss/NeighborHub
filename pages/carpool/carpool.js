// pages/carpool/carpool.js
const api = require('../../utils/api');

const mockTrips = [
  {
    id: 1,
    userId: 1,
    userName: '陈师傅',
    userAvatar: 'https://picsum.photos/seed/cp1/100/100',
    building: '5栋',
    type: 'offer',
    title: '明早去高铁站，可带3人',
    description: '明天早上7点出发去高铁站，走二环快速路大概40分钟，车上还有3个空位，顺路的邻居可以拼车。',
    from: '翡翠湾小区',
    to: '南站高铁站',
    date: '明天',
    time: '07:00',
    seats: 3,
    takenSeats: 1,
    fee: '每人¥20',
    participants: [
      'https://picsum.photos/seed/cp_p1/50/50'
    ],
    status: 'open',
    createdAt: '1小时前'
  },
  {
    id: 2,
    userId: 2,
    userName: '刘姐',
    userAvatar: 'https://picsum.photos/seed/cp2/100/100',
    building: '2栋',
    type: 'seek',
    title: '周六上午求拼车去万象城',
    description: '周六上午想去万象城逛街，有没有顺路的邻居一起？可以分摊油费和停车费。',
    from: '翡翠湾小区',
    to: '万象城',
    date: '周六',
    time: '10:00',
    seats: 0,
    takenSeats: 0,
    fee: '分摊油费',
    participants: [],
    status: 'open',
    createdAt: '3小时前'
  },
  {
    id: 3,
    userId: 3,
    userName: '张哥',
    userAvatar: 'https://picsum.photos/seed/cp3/100/100',
    building: '8栋',
    type: 'offer',
    title: '每天早8点通勤拼车，科技园方向',
    description: '工作日每天早上8点出发去科技园，晚上6点半返回，长期拼车优先，费用好商量。',
    from: '翡翠湾小区',
    to: '科技园',
    date: '工作日',
    time: '08:00',
    seats: 2,
    takenSeats: 2,
    fee: '每月¥500',
    participants: [
      'https://picsum.photos/seed/cp_p2/50/50',
      'https://picsum.photos/seed/cp_p3/50/50'
    ],
    status: 'full',
    createdAt: '昨天'
  },
  {
    id: 4,
    userId: 4,
    userName: '王阿姨',
    userAvatar: 'https://picsum.photos/seed/cp4/100/100',
    building: '3栋',
    type: 'seek',
    title: '下周三机场接人，求顺风车',
    description: '下周三下午3点要去机场接孩子，有没有顺路去机场的邻居？可以付油费。',
    from: '翡翠湾小区',
    to: '白云机场',
    date: '下周三',
    time: '15:00',
    seats: 0,
    takenSeats: 0,
    fee: '付油费',
    participants: [],
    status: 'open',
    createdAt: '2天前'
  },
  {
    id: 5,
    userId: 5,
    userName: '赵叔',
    userAvatar: 'https://picsum.photos/seed/cp5/100/100',
    building: '6栋',
    type: 'offer',
    title: '周末山姆采购，可带2人',
    description: '这周日下午2点去山姆会员店采购，去的时候车上空间大，可以带2个邻居一起去。回来的时候帮带东西也行。',
    from: '翡翠湾小区',
    to: '山姆会员店',
    date: '周日',
    time: '14:00',
    seats: 2,
    takenSeats: 0,
    fee: '免费',
    participants: [],
    status: 'open',
    createdAt: '5小时前'
  }
];

Page({
  data: {
    tabs: ['全部', '有车带人', '找车搭乘'],
    activeTab: 0,
    tripList: [],
    filteredList: []
  },

  onLoad() {
    this.loadTrips();
  },

  onShow() {
    this.loadTrips();
  },

  async loadTrips() {
    try {
      const data = await api.getCarpools();
      const list = data.list || [];
      if (list.length > 0) {
        this.setData({ tripList: list });
      } else {
        this.setData({ tripList: mockTrips });
      }
    } catch (err) {
      this.setData({ tripList: mockTrips });
    }
    this.filterList();
  },

  filterList() {
    const tab = this.data.activeTab;
    let filtered = this.data.tripList;
    if (tab === 1) filtered = filtered.filter(i => i.type === 'offer');
    if (tab === 2) filtered = filtered.filter(i => i.type === 'seek');
    this.setData({ filteredList: filtered });
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    this.filterList();
  },

  onContact(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.filteredList.find(t => t.id === id);
    if (!item || !item.userId) return;
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.onContact(e); });
      return;
    }
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + item.userId +
        '&nickName=' + encodeURIComponent(item.userName || '') +
        '&avatarUrl=' + encodeURIComponent(item.userAvatar || '')
    });
  },

  async onJoin(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.onJoin(e); });
      return;
    }
    try {
      const data = await api.joinCarpool(id);
      const list = this.data.filteredList.map(item => {
        if (item.id === id) return { ...item, joined: true, takenSeats: data.takenSeats, status: data.status };
        return item;
      });
      const tripList = this.data.tripList.map(item => {
        if (item.id === id) return { ...item, joined: true, takenSeats: data.takenSeats, status: data.status };
        return item;
      });
      this.setData({ filteredList: list, tripList });
      wx.showToast({ title: '拼车成功', icon: 'success' });
    } catch (err) {
      // fallback: mock data local update
      const list = this.data.filteredList.map(item => {
        if (item.id === id) return { ...item, joined: true, takenSeats: item.takenSeats + 1 };
        return item;
      });
      const tripList = this.data.tripList.map(item => {
        if (item.id === id) return { ...item, joined: true, takenSeats: item.takenSeats + 1 };
        return item;
      });
      this.setData({ filteredList: list, tripList });
      wx.showToast({ title: '拼车成功', icon: 'success' });
    }
  },

  goPublish() {
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.login(() => { this.goPublish(); });
      return;
    }
    wx.navigateTo({ url: '/pages/publish/publish?type=carpool' });
  }
});
