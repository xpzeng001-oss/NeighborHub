const app = getApp();
const api = require('../../utils/api');

const typeMap = {
  need: { label: '寻求喂养', icon: 'paw-print', color: '#E8883C' },
  offer: { label: '可以帮喂', icon: 'heart', color: '#5B8C3E' },
  social: { label: '宠物活动', icon: 'sparkles', color: '#8B6DB0' }
};

const btnTextMap = {
  need: '我来帮忙',
  offer: '我需要',
  social: '我要参加'
};

Page({
  data: {
    statusBarHeight: 44,
    detail: null,
    typeInfo: {},
    btnText: '',
    respondents: [],
    responded: false
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight });
    if (options.id) {
      this.loadDetail(options.id);
    }
  },

  async loadDetail(id) {
    try {
      const data = await api.getPetDetail(id);
      const detail = data || {};
      this.setData({
        detail,
        typeInfo: typeMap[detail.type] || typeMap.need,
        btnText: btnTextMap[detail.type] || '我要参加',
        respondents: detail.respondents || []
      });
    } catch (err) {
      console.log('加载详情失败，使用mock数据', err);
      // Mock 数据用于验证页面
      const mock = {
        id: id,
        type: 'need',
        title: '春节出游，求靠谱猫咪寄养',
        description: '1月25日-2月2日出去旅游，家里英短蓝猫需要人照顾，猫粮猫砂全提供。\n\n猫咪性格温顺，不挑食，每天喂两次猫粮、换一次水即可。需要每天铲一次猫砂。\n\n希望找有养猫经验的邻居，最好能每天拍照/视频反馈一下~',
        userName: '小王妈妈',
        userAvatar: '',
        building: '3栋1单元',
        userId: '1',
        createdAt: '2小时前',
        dateRange: '1月25日 - 2月2日',
        reward: '200元/天',
        tags: ['猫咪', '寄养', '春节'],
        responseCount: 3,
        respondents: [
          { id: '2', nickName: '李阿姨', avatarUrl: '' },
          { id: '3', nickName: '张小明', avatarUrl: '' },
          { id: '4', nickName: '赵姐', avatarUrl: '' }
        ]
      };
      this.setData({
        detail: mock,
        typeInfo: typeMap[mock.type],
        btnText: btnTextMap[mock.type],
        respondents: mock.respondents
      });
    }
  },

  goBack() {
    wx.navigateBack();
  },

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

  async onRespond() {
    const item = this.data.detail;
    if (!item) return;
    if (!app.globalData.userInfo) {
      app.login(() => { this.onRespond(); });
      return;
    }
    try {
      const data = await api.respondPet(item.id);
      this.setData({
        'detail.responseCount': data.responseCount,
        responded: true,
        respondents: data.respondents || this.data.respondents
      });
      wx.showToast({ title: '报名成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: err.message || '报名失败', icon: 'none' });
    }
  },

  onShareAppMessage() {
    const d = this.data.detail;
    return {
      title: d ? d.title : '宠物喂养',
      path: '/pages/petDetail/petDetail?id=' + (d ? d.id : '')
    };
  }
});
