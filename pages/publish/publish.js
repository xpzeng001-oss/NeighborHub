// pages/publish/publish.js
const api = require('../../utils/api');

const categories = [
  { id: 'digital', name: '数码' },
  { id: 'furniture', name: '家具' },
  { id: 'appliance', name: '家电' },
  { id: 'baby', name: '母婴' },
  { id: 'sports', name: '运动' },
  { id: 'clothing', name: '服饰' },
  { id: 'books', name: '图书' },
  { id: 'tools', name: '工具' },
  { id: 'other', name: '其他' }
];

const conditions = ['全新', '九五新', '九成新', '八成新', '有使用痕迹'];

Page({
  data: {
    statusBarHeight: 44,
    publishType: 'product',
    imageList: [],
    categoryNames: categories.map(c => c.name),
    form: {
      title: '',
      category: '',       // 存 id，如 'digital'
      categoryName: '',   // 存显示名，如 '数码'
      price: '',
      originalPrice: '',
      condition: '',
      description: '',
      tradeMethod: '',
      postCategory: '',
      isUrgent: false
    }
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
  },

  onShow() {
  },

  goBack() {
    wx.navigateBack();
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      publishType: type,
      imageList: [],
      form: {
        title: '',
        category: '',
        categoryName: '',
        price: '',
        originalPrice: '',
        condition: '',
        description: '',
        tradeMethod: '',
        postCategory: '',
        isUrgent: false
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
        this.setData({ imageList: [...this.data.imageList, ...newImages] });
      }
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.imageList;
    list.splice(index, 1);
    this.setData({ imageList: list });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      'form.category': categories[index].id,
      'form.categoryName': categories[index].name
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

  async onPublish() {
    const { form, publishType, imageList } = this.data;

    // fix: 先检查登录状态，避免无意义 loading
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    // 基础校验
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
    // fix: 发帖必须选分类
    if (publishType === 'post' && !form.postCategory) {
      wx.showToast({ title: '请选择帖子分类', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '发布中...' });
    try {
      let imageUrls = [];
      if (imageList.length > 0) {
        imageUrls = await api.uploadImages(imageList);
      }

      if (publishType === 'product' || publishType === 'free') {
        await api.createProduct({
          title: form.title,
          price: publishType === 'free' ? 0 : Number(form.price),
          originalPrice: Number(form.originalPrice) || 0,
          isFree: publishType === 'free',
          category: form.category,
          condition: form.condition,
          images: imageUrls,
          description: form.description,
          tradeMethod: form.tradeMethod
        });
      } else if (publishType === 'post') {
        await api.createPost({
          category: form.postCategory,
          title: form.title,
          content: form.description,
          images: imageUrls
        });
      } else if (publishType === 'help') {
        await api.createHelp({
          title: form.title,
          description: form.description,
          isUrgent: form.isUrgent
        });
      }

      wx.hideLoading();
      wx.showToast({ title: '发布成功！', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1500);
    } catch (err) {
      wx.hideLoading();
      // fix: 显示真实错误信息
      const msg = (err && err.message && err.message.length <= 12)
        ? err.message
        : '发布失败，请重试';
      wx.showToast({ title: msg, icon: 'none' });
    }
  }
});
