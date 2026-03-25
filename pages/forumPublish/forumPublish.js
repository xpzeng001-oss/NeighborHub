// pages/forumPublish/forumPublish.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    title: '',
    content: '',
    images: [],
    submitting: false
  },

  onLoad() {
    if (!app.globalData.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onChooseImage() {
    const remain = 9 - this.data.images.length;
    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ images: this.data.images.concat(res.tempFilePaths) });
      }
    });
  },

  onDelImage(e) {
    const images = this.data.images;
    images.splice(e.currentTarget.dataset.index, 1);
    this.setData({ images });
  },

  async onSubmit() {
    // 检查是否已设置小区和楼栋
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (!userInfo || !userInfo.community || !userInfo.building) {
      wx.showModal({
        title: '完善信息',
        content: '发布前请先选择您所在的小区和楼栋',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/settings/settings' });
          }
        }
      });
      return;
    }

    if (!this.data.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    try {
      // 上传图片
      let imageUrls = [];
      if (this.data.images.length > 0) {
        imageUrls = await api.uploadImages(this.data.images);
      }

      const app = getApp();
      const community = app.globalData.currentCommunity;
      await api.createPost({
        category: '帖子',
        title: this.data.title.trim(),
        content: this.data.content.trim(),
        images: imageUrls,
        communityId: (community && community.id) || null
      });

      wx.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      console.log('发帖失败', err);
    } finally {
      this.setData({ submitting: false });
    }
  }
});