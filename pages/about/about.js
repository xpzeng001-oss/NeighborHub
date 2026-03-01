// pages/about/about.js
Page({
  data: {
    features: [
      { icon: 'storefront', color: '#5B8C3E', title: '闲置交易', desc: '发布和购买小区内的闲置好物' },
      { icon: 'handshake', color: '#4A90D9', title: '邻里互助', desc: '发起帮忙请求，邻居来帮忙' },
      { icon: 'message-circle', color: '#E8883C', title: '社区论坛', desc: '和邻居聊聊小区里的大小事' },
      { icon: 'star', color: '#D4A04A', title: '信用体系', desc: '完善的信用评分，交易更放心' }
    ]
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  }
});