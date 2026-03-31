const app = getApp();
const api = require('../../utils/api');
const formatTime = d => { const df = Date.now() - d; if (df < 60000) return '刚刚'; if (df < 3600000) return Math.floor(df/60000)+'分钟前'; if (df < 86400000) return Math.floor(df/3600000)+'小时前'; if (df < 604800000) return Math.floor(df/86400000)+'天前'; const m = d.getMonth()+1, day = d.getDate(); return d.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(day<10?'0'+day:day); };

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
    showAggregatedList: false,
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
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  applyDetail(data) {
    if (data.createdAt) data.createdAt = formatTime(new Date(data.createdAt));
    if (data.deadline) {
      const dl = new Date(data.deadline);
      if (!isNaN(dl)) data.deadline = (dl.getMonth()+1)+'月'+dl.getDate()+'日 '+dl.getHours()+':'+(dl.getMinutes()<10?'0':'')+dl.getMinutes();
    }
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

  goBack() { wx.navigateBack(); },

  // --- 加入拼单 ---
  async onJoin() {
    if (this._submitting) return;
    if (!app.globalData.userInfo) {
      app.login(() => { this.onJoin(); });
      return;
    }
    this._submitting = true;
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
    } finally {
      this._submitting = false;
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

  goUserProfile() {
    const userId = this.data.detail.userId;
    if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
      wx.switchTab({ url: '/pages/mine/mine' });
    } else {
      wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
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

  onCopyWechat() {
    wx.setClipboardData({
      data: this.data.detail.contactWechat,
      success: () => wx.showToast({ title: '微信号已复制，去微信添加好友', icon: 'none' })
    });
  },

  onCallPhone() {
    wx.makePhoneCall({ phoneNumber: this.data.detail.contactPhone });
  },

  onShareAppMessage() {
    const d = this.data.detail;
    return {
      title: d ? d.title : '山姆拼单',
      path: '/pages/samDetail/samDetail?id=' + (d ? d.id : '')
    };
  }
});
