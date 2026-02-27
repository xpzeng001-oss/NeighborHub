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
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url: url });
    },
    goPage(e) {
      const url = e.currentTarget.dataset.path;
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
        }
      });
    }
  }
});
