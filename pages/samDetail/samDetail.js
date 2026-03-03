const app = getApp();
const api = require('../../utils/api');

const statusMap = {
  open: { label: '拼单中', cls: 'open' },
  full: { label: '已成团', cls: 'full' },
  closed: { label: '已截止', cls: 'closed' }
};

Page({
  data: {
    statusBarHeight: 44,
    detail: null,
    statusInfo: {},
    participants: [],
    updates: [],
    isOrganizer: false,
    isJoined: false,
    myShoppingList: '',
    showListModal: false,
    listInput: '',
    showUpdateModal: false,
    updateInput: '',
    updateTag: '',
    showAggregatedList: false
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
    if (options.id) {
      this.orderId = options.id;
      this.loadDetail(options.id);
    }
  },

  onShow() {
    if (this.orderId) this.loadDetail(this.orderId);
  },

  async loadDetail(id) {
    try {
      const data = await api.getSamDetail(id);
      this.applyDetail(data);
    } catch (err) {
      console.log('加载详情失败，使用mock数据', err);
      this.loadMockData(id);
    }
  },

  applyDetail(data) {
    this.setData({
      detail: data,
      statusInfo: statusMap[data.status] || statusMap.open,
      participants: data.participants || [],
      updates: data.updates || [],
      isOrganizer: data.isOrganizer || false,
      isJoined: data.isJoined || false,
      myShoppingList: data.myShoppingList || ''
    });
  },

  loadMockData(id) {
    const currentUserId = app.globalData.userInfo ? app.globalData.userInfo.id : null;
    const mock = {
      id: id,
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
      status: 'open',
      createdAt: '2小时前',
      isOrganizer: currentUserId === 1,
      isJoined: true,
      myShoppingList: '- 瑞士卷 x2\n- 牛角包 x3\n- 牛奶 2L',
      participants: [
        { userId: 2, userName: '李阿姨', userAvatar: '', building: '3栋2单元', shoppingList: '- 洗衣液 x1\n- 厨房纸巾 x2', pickupStatus: 'pending' },
        { userId: 3, userName: '张小明', userAvatar: '', building: '5栋', shoppingList: '- A5和牛 1kg\n- 三文鱼 500g', pickupStatus: 'picked_up' },
        { userId: 4, userName: '赵姐', userAvatar: '', building: '3栋', shoppingList: '', pickupStatus: 'pending' },
        { userId: 5, userName: '王叔叔', userAvatar: '', building: '1栋', shoppingList: '- 蓝莓 x3盒', pickupStatus: 'pending' },
        { userId: 6, userName: '陈妈妈', userAvatar: '', building: '2栋', shoppingList: '- 可颂 x4\n- 曲奇 x2', pickupStatus: 'pending' }
      ],
      updates: [
        { id: 1, content: '已出发去山姆，预计下午3点到', statusTag: 'purchasing', createdAt: '1小时前' },
        { id: 2, content: '到店了，开始采购大家的清单', statusTag: 'purchasing', createdAt: '30分钟前' }
      ]
    };
    this.applyDetail(mock);
  },

  goBack() { wx.navigateBack(); },

  // --- 加入拼单 ---
  async onJoin() {
    if (!app.globalData.userInfo) {
      app.login(() => { this.onJoin(); });
      return;
    }
    try {
      await api.joinSam(this.orderId);
      wx.showToast({ title: '拼单成功', icon: 'success' });
      this.loadDetail(this.orderId);
    } catch (err) {
      // mock fallback
      const d = this.data.detail;
      this.setData({
        isJoined: true,
        'detail.currentCount': d.currentCount + 1
      });
      wx.showToast({ title: '拼单成功', icon: 'success' });
    }
  },

  // --- 采购清单 ---
  openListModal() {
    this.setData({ showListModal: true, listInput: this.data.myShoppingList });
  },
  closeListModal() {
    this.setData({ showListModal: false });
  },
  onListInput(e) {
    this.setData({ listInput: e.detail.value });
  },
  async submitShoppingList() {
    const content = this.data.listInput.trim();
    if (!content) {
      wx.showToast({ title: '请输入清单内容', icon: 'none' });
      return;
    }
    try {
      await api.updateShoppingList(this.orderId, { content });
      this.setData({ myShoppingList: content, showListModal: false });
      wx.showToast({ title: '清单已提交', icon: 'success' });
      this.loadDetail(this.orderId);
    } catch (err) {
      this.setData({ myShoppingList: content, showListModal: false });
      wx.showToast({ title: '清单已提交', icon: 'success' });
    }
  },

  // --- 进度更新（团长） ---
  openUpdateModal() {
    this.setData({ showUpdateModal: true, updateInput: '', updateTag: '' });
  },
  closeUpdateModal() {
    this.setData({ showUpdateModal: false });
  },
  onUpdateInput(e) {
    this.setData({ updateInput: e.detail.value });
  },
  selectUpdateTag(e) {
    const tag = e.currentTarget.dataset.tag;
    this.setData({ updateTag: this.data.updateTag === tag ? '' : tag });
  },
  async submitUpdate() {
    const content = this.data.updateInput.trim();
    if (!content) {
      wx.showToast({ title: '请输入更新内容', icon: 'none' });
      return;
    }
    try {
      await api.postSamUpdate(this.orderId, { content, statusTag: this.data.updateTag });
      this.setData({ showUpdateModal: false });
      wx.showToast({ title: '更新已发布', icon: 'success' });
      this.loadDetail(this.orderId);
    } catch (err) {
      const updates = this.data.updates.slice();
      updates.unshift({ id: Date.now(), content, statusTag: this.data.updateTag, createdAt: '刚刚' });
      this.setData({ updates, showUpdateModal: false });
      wx.showToast({ title: '更新已发布', icon: 'success' });
    }
  },

  // --- 汇总清单（团长） ---
  toggleAggregatedList() {
    this.setData({ showAggregatedList: !this.data.showAggregatedList });
  },

  // --- 取货状态（团长） ---
  async togglePickup(e) {
    const userId = e.currentTarget.dataset.userId;
    const current = e.currentTarget.dataset.status;
    const newStatus = current === 'picked_up' ? 'pending' : 'picked_up';
    try {
      await api.updatePickupStatus(this.orderId, userId, { status: newStatus });
      this.loadDetail(this.orderId);
    } catch (err) {
      const participants = this.data.participants.map(p => {
        if (p.userId === userId) return { ...p, pickupStatus: newStatus };
        return p;
      });
      this.setData({ participants });
    }
  },

  // --- 联系团长 ---
  onContact() {
    const item = this.data.detail;
    if (!item || !item.userId) return;
    if (!app.globalData.userInfo) {
      app.login(() => { this.onContact(); });
      return;
    }
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + item.userId +
        '&nickName=' + encodeURIComponent(item.userName || '') +
        '&avatarUrl=' + encodeURIComponent(item.userAvatar || '')
    });
  },

  onShareAppMessage() {
    const d = this.data.detail;
    return {
      title: d ? d.title : '山姆拼单',
      path: '/pages/samDetail/samDetail?id=' + (d ? d.id : '')
    };
  }
});
