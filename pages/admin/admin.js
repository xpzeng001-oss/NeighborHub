const api = require('../../utils/api');

const TYPE_LABELS = {
  product: '闲置', post: '论坛', pet: '宠物',
  sam: '拼单', carpool: '拼车', help: '互助',
  comment: '评论', user: '用户'
};

const STATUS_LABELS = {
  pending: '待处理', resolved: '已处理', rejected: '已驳回',
  active: '正常', off: '已下架'
};

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const target = new Date(dateStr).getTime();
  const diff = now - target;
  if (diff < 0) return '刚刚';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return minutes + '分钟前';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + '小时前';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + '天前';
  const months = Math.floor(days / 30);
  if (months < 12) return months + '个月前';
  return Math.floor(months / 12) + '年前';
}

function formatList(list, isReport) {
  return (list || []).map(item => {
    const formatted = { ...item };
    formatted.timeText = relativeTime(item.createdAt);
    if (isReport) {
      formatted.targetTypeText = TYPE_LABELS[item.targetType] || item.targetType;
      formatted.statusText = STATUS_LABELS[item.status] || item.status;
    } else if (item.type) {
      formatted.typeText = TYPE_LABELS[item.type] || item.type;
    }
    return formatted;
  });
}

Page({
  data: {
    tab: 'report',

    // Stats
    stats: { pendingReports: 0, todayViolations: 0, bannedUsers: 0, contentCounts: {} },

    // Reports tab
    reportFilter: 'pending',
    reportList: [],
    reportPage: 1,
    reportHasMore: true,

    // Content tab
    contentType: 'all',
    contentStatus: 'all',
    contentList: [],
    contentPage: 1,
    contentHasMore: true,

    // Users tab
    userList: [],
    userPage: 1,
    userHasMore: true,
    userKeyword: '',

    loading: false
  },

  onLoad() {
    this.loadStats();
    this.loadReports();
  },

  onPullDownRefresh() {
    this.loadStats();
    const tab = this.data.tab;
    if (tab === 'report') {
      this.setData({ reportPage: 1, reportList: [], reportHasMore: true });
      this.loadReports().then(() => wx.stopPullDownRefresh());
    } else if (tab === 'content') {
      this.setData({ contentPage: 1, contentList: [], contentHasMore: true });
      this.loadContent().then(() => wx.stopPullDownRefresh());
    } else {
      this.setData({ userPage: 1, userList: [], userHasMore: true });
      this.loadUsers().then(() => wx.stopPullDownRefresh());
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.tab) return;
    this.setData({ tab });
    if (tab === 'report' && this.data.reportList.length === 0) {
      this.loadReports();
    } else if (tab === 'content' && this.data.contentList.length === 0) {
      this.loadContent();
    } else if (tab === 'user' && this.data.userList.length === 0) {
      this.loadUsers();
    }
  },

  async loadStats() {
    try {
      const stats = await api.getAdminStats();
      this.setData({ stats });
    } catch (err) {
      console.log('[Admin] loadStats error:', err);
    }
  },

  // ==================== Reports ====================

  async loadReports() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const params = {
        status: this.data.reportFilter,
        page: this.data.reportPage,
        pageSize: 20
      };
      const result = await api.getAdminReports(params);
      const newList = formatList(result.list, true);
      this.setData({
        reportList: this.data.reportPage === 1 ? newList : [...this.data.reportList, ...newList],
        reportPage: this.data.reportPage + 1,
        reportHasMore: newList.length >= 20,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  switchReportFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    if (filter === this.data.reportFilter) return;
    this.setData({
      reportFilter: filter,
      reportPage: 1,
      reportList: [],
      reportHasMore: true
    });
    this.loadReports();
  },

  handleReport(e) {
    const { id, index } = e.currentTarget.dataset;
    wx.showActionSheet({
      itemList: ['确认违规并下架', '驳回举报'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this._resolveReport(id, index);
        } else if (res.tapIndex === 1) {
          this._rejectReport(id, index);
        }
      }
    });
  },

  async _resolveReport(id, index) {
    try {
      wx.showLoading({ title: '处理中...' });
      await api.handleAdminReport(id, { action: 'resolve', takedown: true });
      wx.hideLoading();
      wx.showToast({ title: '已确认违规', icon: 'success' });
      this.setData({ reportPage: 1, reportList: [], reportHasMore: true });
      this.loadStats();
      this.loadReports();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    }
  },

  async _rejectReport(id, index) {
    try {
      wx.showLoading({ title: '处理中...' });
      await api.handleAdminReport(id, { action: 'reject' });
      wx.hideLoading();
      wx.showToast({ title: '已驳回', icon: 'success' });
      this.setData({ reportPage: 1, reportList: [], reportHasMore: true });
      this.loadStats();
      this.loadReports();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    }
  },

  // ==================== Content ====================

  async loadContent() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const params = {
        type: this.data.contentType,
        status: this.data.contentStatus,
        page: this.data.contentPage,
        pageSize: 20
      };
      const result = await api.getAdminContent(params);
      const newList = formatList(result.list, false);
      this.setData({
        contentList: this.data.contentPage === 1 ? newList : [...this.data.contentList, ...newList],
        contentPage: this.data.contentPage + 1,
        contentHasMore: newList.length >= 20,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  switchContentType(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.contentType) return;
    this.setData({
      contentType: type,
      contentPage: 1,
      contentList: [],
      contentHasMore: true
    });
    this.loadContent();
  },

  switchContentStatus(e) {
    const status = e.currentTarget.dataset.status;
    if (status === this.data.contentStatus) return;
    this.setData({
      contentStatus: status,
      contentPage: 1,
      contentList: [],
      contentHasMore: true
    });
    this.loadContent();
  },

  takedownContent(e) {
    const { type, id, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认下架',
      content: '确认下架该内容？下架后用户将无法查看。',
      confirmColor: '#E8636F',
      confirmText: '下架',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' });
            await api.takedownContent(type, id, { reason: '管理员下架' });
            wx.hideLoading();
            wx.showToast({ title: '已下架', icon: 'success' });
            // Update local list item status
            const key = 'contentList[' + index + '].status';
            this.setData({ [key]: 'off' });
            this.loadStats();
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: err.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  restoreContent(e) {
    const { type, id, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认恢复',
      content: '确认恢复该内容？恢复后用户可正常查看。',
      confirmColor: '#C67A52',
      confirmText: '恢复',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' });
            await api.restoreContent(type, id);
            wx.hideLoading();
            wx.showToast({ title: '已恢复', icon: 'success' });
            const key = 'contentList[' + index + '].status';
            this.setData({ [key]: 'active' });
            this.loadStats();
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: err.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // ==================== Users ====================

  async loadUsers() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const params = {
        page: this.data.userPage,
        pageSize: 20,
        keyword: this.data.userKeyword
      };
      const result = await api.getAdminUsers(params);
      const newList = formatList(result.list, false);
      this.setData({
        userList: this.data.userPage === 1 ? newList : [...this.data.userList, ...newList],
        userPage: this.data.userPage + 1,
        userHasMore: newList.length >= 20,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  searchUser(e) {
    this.setData({
      userKeyword: e.detail.value,
      userPage: 1,
      userList: [],
      userHasMore: true
    });
    // Debounce search
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.loadUsers();
    }, 400);
  },

  banUser(e) {
    const { id, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认封禁',
      content: '封禁后该用户将无法使用任何功能，确认封禁？',
      confirmColor: '#E8636F',
      confirmText: '封禁',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' });
            await api.banUser(id, { reason: '管理员封禁' });
            wx.hideLoading();
            wx.showToast({ title: '已封禁', icon: 'success' });
            const key = 'userList[' + index + '].isBanned';
            this.setData({ [key]: true });
            this.loadStats();
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: err.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  unbanUser(e) {
    const { id, index } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认解封',
      content: '解封后该用户可正常使用所有功能，确认解封？',
      confirmColor: '#C67A52',
      confirmText: '解封',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' });
            await api.unbanUser(id);
            wx.hideLoading();
            wx.showToast({ title: '已解封', icon: 'success' });
            const key = 'userList[' + index + '].isBanned';
            this.setData({ [key]: false });
            this.loadStats();
          } catch (err) {
            wx.hideLoading();
            wx.showToast({ title: err.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // ==================== Common ====================

  loadMore() {
    const tab = this.data.tab;
    if (tab === 'report' && this.data.reportHasMore && !this.data.loading) {
      this.loadReports();
    } else if (tab === 'content' && this.data.contentHasMore && !this.data.loading) {
      this.loadContent();
    } else if (tab === 'user' && this.data.userHasMore && !this.data.loading) {
      this.loadUsers();
    }
  }
});
