// pages/detail/detail.js
const api = require('../../utils/api');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    product: {},
    currentImage: 0,
    isFav: false,
    timeAgo: ''
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
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
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
    wx.showActionSheet({
      itemList: ['虚假商品', '欺诈行为', '广告骚扰', '违规内容', '其他'],
      success: () => {
        wx.showToast({ title: '举报已提交', icon: 'success' });
      }
    });
  },

  onShare() {},

  onShareAppMessage() {
    return {
      title: this.data.product.title,
      path: '/pages/detail/detail?id=' + this.data.product.id
    };
  }
});
