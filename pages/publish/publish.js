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
    lockedType: false,    // 从子页面进入时锁定类型，隐藏 tab 栏
    imageList: [],
    categoryNames: categories.map(c => c.name),
    tagInputValue: '',
    today: '',
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
      isUrgent: false,
      petPostType: 'need',
      petName: '',
      petStartDate: '',
      petEndDate: '',
      reward: '',
      samDeadlineDate: '',
      samDeadlineTime: '',
      samPickupMethod: '',
      samMinAmount: '',
      samTargetCount: '',
      carpoolType: 'offer',
      carpoolFrom: '',
      carpoolTo: '',
      carpoolDate: '',
      carpoolTime: '',
      carpoolSeats: '',
      carpoolFee: '',
      activityStartDate: '',
      activityStartTime: '',
      activityEndDate: '',
      activityEndTime: '',
      activityLocation: '',
      activityPrice: '',
      activityMaxParticipants: ''
    }
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    const now = new Date();
    const y = now.getFullYear(), m = ('0' + (now.getMonth() + 1)).slice(-2), d = ('0' + now.getDate()).slice(-2);
    const data = { statusBarHeight: sysInfo.statusBarHeight || 44, today: y + '-' + m + '-' + d };
    const validTypes = ['product', 'free', 'post', 'help', 'pet', 'sam', 'carpool', 'activity'];
    if (options.type && validTypes.indexOf(options.type) !== -1) {
      data.publishType = options.type;
      data.lockedType = true;
    }
    this.setData(data);
  },

  onShow() {
  },

  goBack() {
    wx.navigateBack();
  },

  switchType(e) {
    if (this.data.lockedType) return;
    const type = e.currentTarget.dataset.type;
    this.setData({
      publishType: type,
      imageList: [],
      tagInputValue: '',
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
        isUrgent: false,
        petPostType: 'need',
        petName: '',
        petStartDate: '',
        petEndDate: '',
        reward: '',
        samDeadlineDate: '',
      samDeadlineTime: '',
        samPickupMethod: '',
        samMinAmount: '',
        samTargetCount: '',
        carpoolType: 'offer',
        carpoolFrom: '',
        carpoolTo: '',
        carpoolDate: '',
        carpoolTime: '',
        carpoolSeats: '',
        carpoolFee: '',
        activityStartDate: '',
        activityStartTime: '',
        activityEndDate: '',
        activityEndTime: '',
        activityLocation: '',
        activityPrice: '',
        activityMaxParticipants: ''
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

  onPetTypeChange(e) {
    this.setData({ 'form.petPostType': e.currentTarget.dataset.type });
  },

  onTagInput(e) {
    this.setData({ tagInputValue: e.detail.value });
  },

  addPetTag() {
    const val = this.data.tagInputValue.trim();
    if (!val) return;
    const tags = this.data.form.petTags;
    if (tags.length >= 5) return;
    if (tags.indexOf(val) !== -1) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }
    tags.push(val);
    this.setData({ 'form.petTags': tags, tagInputValue: '' });
  },

  removePetTag(e) {
    const index = e.currentTarget.dataset.index;
    const tags = this.data.form.petTags;
    tags.splice(index, 1);
    this.setData({ 'form.petTags': tags });
  },

  onPetStartDate(e) {
    this.setData({ 'form.petStartDate': e.detail.value });
    if (this.data.form.petEndDate && this.data.form.petEndDate < e.detail.value) {
      this.setData({ 'form.petEndDate': '' });
    }
  },

  onPetEndDate(e) {
    this.setData({ 'form.petEndDate': e.detail.value });
  },

  onCarpoolTypeChange(e) {
    this.setData({ 'form.carpoolType': e.currentTarget.dataset.type });
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
    if (publishType === 'post' && !form.postCategory) {
      wx.showToast({ title: '请选择帖子分类', icon: 'none' });
      return;
    }
    if (publishType === 'pet' && !form.petPostType) {
      wx.showToast({ title: '请选择发布类型', icon: 'none' });
      return;
    }
    if (publishType === 'carpool') {
      if (!form.carpoolFrom.trim()) {
        wx.showToast({ title: '请输入出发地', icon: 'none' });
        return;
      }
      if (!form.carpoolTo.trim()) {
        wx.showToast({ title: '请输入目的地', icon: 'none' });
        return;
      }
      if (!form.carpoolDate) {
        wx.showToast({ title: '请选择出发日期', icon: 'none' });
        return;
      }
      if (!form.carpoolTime) {
        wx.showToast({ title: '请选择出发时间', icon: 'none' });
        return;
      }
    }
    if (publishType === 'activity') {
      if (!form.activityStartDate) {
        wx.showToast({ title: '请选择开始日期', icon: 'none' });
        return;
      }
      if (!form.activityLocation.trim()) {
        wx.showToast({ title: '请输入活动地点', icon: 'none' });
        return;
      }
    }

    wx.showLoading({ title: '发布中...' });
    try {
      let imageUrls = [];
      if (imageList.length > 0) {
        imageUrls = await api.uploadImages(imageList);
      }

      const app = getApp();
      const community = app.globalData.currentCommunity;
      const communityId = (community && community.id) || null;

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
          tradeMethod: form.tradeMethod,
          communityId
        });
      } else if (publishType === 'post') {
        await api.createPost({
          category: form.postCategory,
          title: form.title,
          content: form.description,
          images: imageUrls,
          communityId
        });
      } else if (publishType === 'help') {
        await api.createHelp({
          title: form.title,
          description: form.description,
          isUrgent: form.isUrgent,
          communityId
        });
      } else if (publishType === 'pet') {
        const dateRange = form.petStartDate && form.petEndDate
          ? form.petStartDate + ' ~ ' + form.petEndDate
          : form.petStartDate || '';
        await api.createPet({
          type: form.petPostType,
          title: form.title,
          description: form.description,
          petName: form.petName,
          images: imageUrls,
          dateRange,
          reward: form.reward,
          communityId
        });
      } else if (publishType === 'sam') {
        const samResult = await api.createSam({
          title: form.title,
          description: form.description,
          deadline: (form.samDeadlineDate && form.samDeadlineTime) ? form.samDeadlineDate + ' ' + form.samDeadlineTime : form.samDeadlineDate || '',
          pickupMethod: form.samPickupMethod,
          minAmount: form.samMinAmount,
          targetCount: form.samTargetCount,
          communityId
        });
        wx.hideLoading();
        wx.showToast({ title: '发布成功！', icon: 'success' });
        setTimeout(() => {
          const newId = samResult && samResult.id;
          if (newId) {
            wx.redirectTo({ url: '/pages/samDetail/samDetail?id=' + newId });
          } else {
            wx.navigateBack();
          }
        }, 1500);
        return;
      } else if (publishType === 'carpool') {
        await api.createCarpool({
          type: form.carpoolType,
          title: form.title,
          description: form.description,
          from: form.carpoolFrom,
          to: form.carpoolTo,
          date: form.carpoolDate,
          time: form.carpoolTime,
          seats: Number(form.carpoolSeats) || 0,
          fee: form.carpoolFee,
          communityId
        });
      } else if (publishType === 'activity') {
        const startTime = (form.activityStartDate && form.activityStartTime)
          ? form.activityStartDate + ' ' + form.activityStartTime
          : form.activityStartDate || '';
        const endTime = (form.activityEndDate && form.activityEndTime)
          ? form.activityEndDate + ' ' + form.activityEndTime
          : form.activityEndDate || '';
        const activityResult = await api.createActivity({
          title: form.title,
          description: form.description,
          coverImage: imageUrls[0] || '',
          images: imageUrls,
          startTime,
          endTime,
          location: form.activityLocation,
          price: form.activityPrice,
          maxParticipants: form.activityMaxParticipants,
          communityId
        });
        wx.hideLoading();
        wx.showToast({ title: '发布成功！', icon: 'success' });
        setTimeout(() => {
          const newId = activityResult && activityResult.id;
          if (newId) {
            wx.redirectTo({ url: '/pages/activityDetail/activityDetail?id=' + newId });
          } else {
            wx.navigateBack();
          }
        }, 1500);
        return;
      }

      wx.hideLoading();
      wx.showToast({ title: '发布成功！', icon: 'success' });
      setTimeout(() => {
        if (this.data.lockedType) {
          wx.navigateBack();
        } else {
          wx.switchTab({ url: '/pages/index/index' });
        }
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
