// pages/detail/detail.js
const api = require('../../utils/api');
function callWithMask(phone) {
  if (!phone) return;
  const masked = phone.length >= 7 ? phone.substring(0,3)+'****'+phone.substring(phone.length-4) : phone;
  wx.showModal({ title:'电话联系', content:'确认拨打 '+masked+' ？', confirmText:'拨打', confirmColor:'#C67A52',
    success(res){ if(res.confirm) wx.makePhoneCall({ phoneNumber: phone }); } });
}
const formatTime = d => { const df = Date.now() - d; if (df < 60000) return '刚刚'; if (df < 3600000) return Math.floor(df/60000)+'分钟前'; if (df < 86400000) return Math.floor(df/3600000)+'小时前'; if (df < 604800000) return Math.floor(df/86400000)+'天前'; const m = d.getMonth()+1, day = d.getDate(); return d.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(day<10?'0'+day:day); };

Page({
  data: {
    product: {},
    currentImage: 0,
    isFav: false,
    timeAgo: '',
    sellerProducts: []
  },

  async onLoad(options) {
    const id = options.id;
    try {
      const product = await api.getProduct(id);
      this.setData({
        product,
        isFav: product.isFavorited || false,
        timeAgo: formatTime(new Date(product.createdAt))
      });
      wx.setNavigationBarTitle({ title: product.title.substring(0, 10) + '...' });
      this.loadSellerProducts();
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 加载卖家其他在售商品
  async loadSellerProducts() {
    const p = this.data.product;
    if (!p.userId) return;
    try {
      const data = await api.getProducts({ userId: p.userId, page: 1, pageSize: 30 });
      const list = (data.list || []).filter(item => item.id !== p.id);
      this.setData({ sellerProducts: list });
    } catch (err) {}
  },

  goSellerProduct(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.product.id) return;
    wx.redirectTo({ url: '/pages/detail/detail?id=' + id });
  },

  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.product.images[index],
      urls: this.data.product.images
    });
  },

  async toggleFav() {
    try {
      const data = await api.toggleFavorite(this.data.product.id);
      this.setData({ isFav: data.isFavorited });
      wx.showToast({
        title: data.isFavorited ? '已收藏' : '已取消收藏',
        icon: 'none'
      });
    } catch (err) {
      wx.showToast({ title: '请先登录', icon: 'none' });
    }
  },

  onCopyWechat() {
    const wechat = this.data.product.contactWechat;
    wx.setClipboardData({
      data: wechat,
      success: () => {
        wx.showToast({ title: '微信号已复制，去微信添加好友', icon: 'none' });
      }
    });
  },

  onCallPhone() {
    callWithMask(this.data.product.contactPhone);
  },

  onChat() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    const p = this.data.product;
    if (!p.userId) return;
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + p.userId +
        '&nickName=' + encodeURIComponent(p.userName || '') +
        '&avatarUrl=' + encodeURIComponent(p.userAvatar || '')
    });
  },

  onWant() {
    wx.showModal({
      title: '想要这个宝贝',
      content: '将通知卖家您对此商品感兴趣，是否继续？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const data = await api.wantProduct(this.data.product.id);
            const product = this.data.product;
            product.wantCount = data.wantCount;
            this.setData({ product });
            wx.showToast({ title: '已通知卖家', icon: 'success' });
          } catch (err) {
            wx.showToast({ title: '请先登录', icon: 'none' });
          }
        }
      }
    });
  },

  onReport() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    const reasons = ['虚假商品', '欺诈行为', '广告骚扰', '违规内容', '其他'];
    wx.showActionSheet({
      itemList: reasons,
      success: async (res) => {
        try {
          await api.createReport({
            targetType: 'product',
            targetId: this.data.product.id,
            reason: reasons[res.tapIndex]
          });
          wx.showToast({ title: '举报已提交', icon: 'success' });
        } catch (err) {
          wx.showToast({ title: '举报失败', icon: 'none' });
        }
      }
    });
  },

  onShare() {
    // 触发微信转发菜单（等同于右上角分享）
    // 微信小程序中 button open-type="share" 才能主动触发
    // 这里用 showShareMenu 确保分享菜单可用
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] });
  },

  viewSeller() {
    const p = this.data.product;
    if (!p.userId) return;
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + p.userId +
        '&nickName=' + encodeURIComponent(p.userName || '') +
        '&avatarUrl=' + encodeURIComponent(p.userAvatar || '')
    });
  },

  goUserProfile() {
    const app = getApp();
    const userId = this.data.product.userId;
    if (!userId) return;
    if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
      wx.switchTab({ url: '/pages/mine/mine' });
    } else {
      wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
    }
  },

  onShareAppMessage() {
    const p = this.data.product;
    const price = p.is_free ? '免费自取' : '¥' + p.price;
    const suffix = ' · ' + price;
    const maxLen = 28 - suffix.length;
    const title = p.title.length > maxLen ? p.title.slice(0, maxLen) + '…' : p.title;
    return {
      title: title + suffix,
      path: '/pages/detail/detail?id=' + p.id,
      imageUrl: (p.images && p.images.length > 0) ? p.images[0] : ''
    };
  }
});
