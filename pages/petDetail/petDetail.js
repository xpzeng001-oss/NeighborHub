const app = getApp();
const api = require('../../utils/api');
function callWithMask(phone) {
  if (!phone) return;
  const masked = phone.length >= 7 ? phone.substring(0,3)+'****'+phone.substring(phone.length-4) : phone;
  wx.showModal({ title:'电话联系', content:'确认拨打 '+masked+' ？', confirmText:'拨打', confirmColor:'#C67A52',
    success(res){ if(res.confirm) wx.makePhoneCall({ phoneNumber: phone }); } });
}
const formatTime = d => { const df = Date.now() - d; if (df < 60000) return '刚刚'; if (df < 3600000) return Math.floor(df/60000)+'分钟前'; if (df < 86400000) return Math.floor(df/3600000)+'小时前'; if (df < 604800000) return Math.floor(df/86400000)+'天前'; const m = d.getMonth()+1, day = d.getDate(); return d.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(day<10?'0'+day:day); };

const typeMap = {
  need: { label: '寻求喂养', icon: 'paw-print', color: '#E8883C' },
  offer: { label: '可以帮喂', icon: 'heart', color: '#C67A52' }
};

const btnTextMap = {
  need: '我来帮忙',
  offer: '我需要'
};

Page({
  data: {
    statusBarHeight: 44,
    detail: null,
    typeInfo: {},
    btnText: '',
    respondents: [],
    responded: false,
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
      if (detail.createdAt) detail.createdAt = formatTime(new Date(detail.createdAt));
      this.setData({
        detail,
        typeInfo: typeMap[detail.type] || typeMap.need,
        btnText: btnTextMap[detail.type] || '我要参加',
        respondents: detail.respondents || [],
        responded: detail.isResponded || false
      });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/index/index' });
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
    // 已报名则取消
    if (this.data.responded) {
      const confirmRes = await new Promise(resolve => {
        wx.showModal({ title: '取消报名', content: '确定要取消报名吗？', success: resolve });
      });
      if (!confirmRes.confirm) return;
      try {
        const data = await api.cancelRespondPet(item.id);
        this.setData({
          'detail.responseCount': data.responseCount || Math.max(0, (this.data.detail.responseCount || 1) - 1),
          responded: false,
          respondents: data.respondents || this.data.respondents
        });
        wx.showToast({ title: '已取消报名', icon: 'success' });
      } catch (err) {
        this.setData({ responded: false, 'detail.responseCount': Math.max(0, (this.data.detail.responseCount || 1) - 1) });
        wx.showToast({ title: '已取消报名', icon: 'success' });
      }
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

  onCopyWechat() {
    wx.setClipboardData({
      data: this.data.detail.contactWechat,
      success: () => wx.showToast({ title: '微信号已复制，去微信添加好友', icon: 'none' })
    });
  },

  onCallPhone() {
    callWithMask(this.data.detail.contactPhone);
  },

  onShareAppMessage() {
    const d = this.data.detail;
    return {
      title: d ? d.title : '宠物喂养',
      path: '/pages/petDetail/petDetail?id=' + (d ? d.id : '')
    };
  }
});
