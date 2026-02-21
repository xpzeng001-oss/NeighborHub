// pages/publish/publish.js
const { categories, conditions } = require('../../utils/mockData');
const { generateId } = require('../../utils/util');

Page({
  data: {
    publishType: 'product',
    imageList: [],
    form: {
      title: '',
      category: '',
      price: '',
      originalPrice: '',
      condition: '',
      description: '',
      tradeMethod: '',
      postCategory: '',
      isUrgent: false
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      publishType: type,
      imageList: [],
      form: {
        title: '', category: '', price: '', originalPrice: '',
        condition: '', description: '', tradeMethod: '',
        postCategory: '', isUrgent: false
      }
    });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onUrgentChange(e) {
    this.setData({ 'form.isUrgent': e.detail.value });
  },

  chooseImage() {
    const remain = 9 - this.data.imageList.length;
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        this.setData({
          imageList: [...this.data.imageList, ...newImages]
        });
      }
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.imageList;
    list.splice(index, 1);
    this.setData({ imageList: list });
  },

  showCategoryPicker() {
    const names = categories.filter(c => c.id !== 'all').map(c => c.name);
    wx.showActionSheet({
      itemList: names,
      success: (res) => {
        this.setData({ 'form.category': names[res.tapIndex] });
      }
    });
  },

  showConditionPicker() {
    wx.showActionSheet({
      itemList: conditions,
      success: (res) => {
        this.setData({ 'form.condition': conditions[res.tapIndex] });
      }
    });
  },

  showTradePicker() {
    const methods = ['楼下交接', '上门自提', '均可'];
    wx.showActionSheet({
      itemList: methods,
      success: (res) => {
        this.setData({ 'form.tradeMethod': methods[res.tapIndex] });
      }
    });
  },

  showPostCategoryPicker() {
    const cats = ['吐槽', '求助', '活动', '公告'];
    wx.showActionSheet({
      itemList: cats,
      success: (res) => {
        this.setData({ 'form.postCategory': cats[res.tapIndex] });
      }
    });
  },

  onPublish() {
    const { form, publishType, imageList } = this.data;

    if (!form.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    if ((publishType === 'product' || publishType === 'free') && imageList.length === 0) {
      wx.showToast({ title: '请上传至少一张图片', icon: 'none' });
      return;
    }

    if (publishType === 'product' && !form.price) {
      wx.showToast({ title: '请输入价格', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发布中...' });
    // 模拟发布
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '发布成功！', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);
    }, 1000);
  }
});
