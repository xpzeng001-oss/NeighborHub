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
