// pages/detail/detail.js
const { mockProducts } = require('../../utils/mockData');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    product: {},
    currentImage: 0,
    isFav: false,
    timeAgo: ''
  },

  onLoad(options) {
    const id = options.id;
    const product = mockProducts.find(p => p.id === id) || mockProducts[0];
    // 模拟增加浏览量
    product.viewCount += 1;
    this.setData({
      product,
      timeAgo: formatTime(new Date(product.createdAt))
    });
    wx.setNavigationBarTitle({ title: product.title.substring(0, 10) + '...' });
  },

  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.product.images[index],
      urls: this.data.product.images
    });
  },

  toggleFav() {
    this.setData({ isFav: !this.data.isFav });
    wx.showToast({
      title: this.data.isFav ? '已收藏' : '已取消收藏',
      icon: 'none'
    });
  },

  onChat() {
    wx.showToast({ title: '私信功能开发中', icon: 'none' });
  },

  onWant() {
    wx.showModal({
      title: '想要这个宝贝',
      content: '将通知卖家您对此商品感兴趣，是否继续？',
      success: (res) => {
        if (res.confirm) {
          const product = this.data.product;
          product.wantCount += 1;
          this.setData({ product });
          wx.showToast({ title: '已通知卖家', icon: 'success' });
        }
      }
    });
  },

  onReport() {
    wx.showActionSheet({
      itemList: ['虚假商品', '欺诈行为', '广告骚扰', '违规内容', '其他'],
      success: (res) => {
        wx.showToast({ title: '举报已提交', icon: 'success' });
      }
    });
  },

  onShare() {
    // 触发分享
  },

  onShareAppMessage() {
    return {
      title: this.data.product.title,
      path: '/pages/detail/detail?id=' + this.data.product.id
    };
  }
});
