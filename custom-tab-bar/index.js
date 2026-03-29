Component({
  data: {
    selected: 0,
    unreadCount: 0
  },

  lifetimes: {
    attached() {
      this.fetchUnread();
      this._timer = setInterval(() => {
        this.fetchUnread();
      }, 10000);
    },
    detached() {
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    }
  },

  methods: {
    _needProfileGuide() {
      const app = getApp();
      const u = app.globalData.userInfo;
      return u && (!u.community || !u.building);
    },
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      // 广场、消息需要完善信息
      if (url !== '/pages/index/index' && url !== '/pages/category/category' && url !== '/pages/mine/mine' && this._needProfileGuide()) {
        wx.showToast({ title: '请先完善个人信息', icon: 'none' });
        wx.switchTab({ url: '/pages/mine/mine' });
        return;
      }
      wx.switchTab({ url: url });
    },
    goPage(e) {
      const url = e.currentTarget.dataset.path;
      const app = getApp();
      if (!app.globalData.userInfo) {
        app.login(() => {
          wx.navigateTo({ url: url });
        });
        return;
      }
      // 发布需要完善信息
      if (this._needProfileGuide()) {
        wx.showToast({ title: '请先完善个人信息', icon: 'none' });
        wx.switchTab({ url: '/pages/mine/mine' });
        return;
      }
      wx.navigateTo({ url: url });
    },
    fetchUnread() {
      const token = wx.getStorageSync('token');
      if (!token) return;
      const app = getApp();
      if (!app || !app.globalData || !app.globalData.baseUrl) return;
      wx.request({
        url: app.globalData.baseUrl + '/api/chat/unread',
        header: { Authorization: 'Bearer ' + token },
        success: (res) => {
          if (res.data && res.data.code === 0 && res.data.data) {
            this.setData({ unreadCount: res.data.data.count || 0 });
          }
        },
        fail: () => {}
      });
    }
  }
});
