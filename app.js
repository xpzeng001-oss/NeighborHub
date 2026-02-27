App({
  globalData: {
    userInfo: null,
    token: '',
    currentCommunity: {
      id: 'c001',
      name: '仁恒峦山美地'
    },
    communities: [
      { id: 'c001', name: '仁恒峦山美地' },
      { id: 'c002', name: '万科城市花园' },
      { id: 'c003', name: '绿地海珀外滩' }
    ],
    baseUrl: 'https://xckjsoft.cn/neighborhub-api', // 生产环境域名
    version: '1.0.0'
  },

  onLaunch() {
    // 恢复登录状态
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    if (userInfo && token) {
      this.globalData.userInfo = userInfo;
      this.globalData.token = token;
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
  login(callback) {
    wx.login({
      success: (loginRes) => {
        wx.request({
          url: this.globalData.baseUrl + '/api/auth/login',
          method: 'POST',
          data: {
            code: loginRes.code
          },
          success: (res) => {
            if (res.data.code === 0) {
              const { token, userInfo } = res.data.data;
              this.globalData.token = token;
              this.globalData.userInfo = userInfo;
              wx.setStorageSync('token', token);
              wx.setStorageSync('userInfo', userInfo);
              callback && callback(userInfo);
            } else {
              wx.showToast({ title: res.data.message || '登录失败', icon: 'none' });
            }
          },
          fail: () => {
            wx.showToast({ title: '网络错误', icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.showToast({ title: '登录失败', icon: 'none' });
      }
    });
  }
});
