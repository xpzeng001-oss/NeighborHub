// pages/forumPublish/forumPublish.js
const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    categories: ['公告', '吐槽', '求助', '活动'],
    catClassMap: { '公告': 'announcement', '吐槽': 'complaint', '求助': 'question', '活动': 'activity' },
    category: '',
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

  onCategoryTap(e) {
    this.setData({ category: e.currentTarget.dataset.cat });
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
    if (!this.data.category) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
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

      await api.createPost({
        category: this.data.category,
        title: this.data.title.trim(),
        content: this.data.content.trim(),
        images: imageUrls
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