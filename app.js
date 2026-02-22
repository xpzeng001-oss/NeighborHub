App({
  globalData: {
    userInfo: null,
    openid: '',
    currentCommunity: {
      id: 'c001',
      name: '仁恒峦山美地'
    },
    communities: [
      { id: 'c001', name: '仁恒峦山美地' },
      { id: 'c002', name: '万科城市花园' },
      { id: 'c003', name: '绿地海珀外滩' }
    ],
    baseUrl: '', // 后端API地址
    version: '1.0.0'
  },

  onLaunch() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
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

  // 模拟登录
  login(callback) {
    wx.getUserProfile({
      desc: '用于完善用户信息',
      success: (res) => {
        const userInfo = res.userInfo;
        userInfo.openid = 'mock_openid_' + Date.now();
        userInfo.credit_score = 100;
        userInfo.building = '';
        this.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
        callback && callback(userInfo);
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    });
  }
});
