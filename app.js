App({
  globalData: {
    userInfo: null,
    token: '',
    currentCommunity: null,
    currentDistrict: null,
    districts: [],
    communities: [],
    baseUrl: 'https://xckjsoft.cn/neighborhub-api', // 生产环境域名
    version: '1.0.0'
  },

  onLaunch(options) {
    // 捕获邀请人参数
    if (options && options.query && options.query.inviter) {
      this.globalData.inviterId = options.query.inviter;
    }
    // 恢复登录状态
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    if (userInfo && token) {
      this.globalData.userInfo = userInfo;
      this.globalData.token = token;
    }
    const avatarConfig = wx.getStorageSync('avatarConfig');
    if (avatarConfig) {
      this.globalData.avatarConfig = avatarConfig;
    }
    // 恢复上次选择的小区和社区
    const savedCommunity = wx.getStorageSync('currentCommunity');
    if (savedCommunity) {
      this.globalData.currentCommunity = savedCommunity;
    }
    const savedDistrict = wx.getStorageSync('currentDistrict');
    if (savedDistrict) {
      this.globalData.currentDistrict = savedDistrict;
    }
    // 检查小程序更新
    this.checkUpdate();
  },

  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(res => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已准备好，是否重启？',
              success(res) {
                if (res.confirm) updateManager.applyUpdate();
              }
            });
          });
        }
      });
    }
  },

  // 微信登录 -> 服务器认证 -> JWT
  // 其他页面调用时跳转到 mine 页面触发登录弹窗
  login(callback) {
    this._loginCallback = callback;
    wx.switchTab({ url: '/pages/mine/mine' });
  }
});
