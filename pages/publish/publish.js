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
    isLocalService: false, // 是否选中"本地服务"大类
    lockedType: false,    // 从子页面进入时锁定类型，隐藏 tab 栏
    showContactModal: false,
    contactPhone: '',
    contactWechat: '',
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
    const validTypes = ['product', 'free', 'post', 'help', 'pet', 'sam', 'carpool', 'activity', 'housekeeping', 'repair', 'tutoring', 'other'];
    const localTypes = ['pet', 'sam', 'carpool', 'housekeeping', 'repair', 'tutoring', 'other'];
    if (options.type && validTypes.indexOf(options.type) !== -1) {
      data.publishType = options.type;
      data.lockedType = true;
      if (localTypes.indexOf(options.type) !== -1) {
        data.isLocalService = true;
      }
    }
    this.setData(data);

    // 编辑模式：加载已有商品数据
    if (options.editId) {
      this._editId = Number(options.editId);
      wx.setNavigationBarTitle({ title: '编辑商品' });
      this.loadProductForEdit(this._editId);
    }
  },

  async loadProductForEdit(id) {
    try {
      wx.showLoading({ title: '加载中...' });
      const p = await api.getProduct(id);
      const catObj = categories.find(c => c.id === p.category);
      const isFree = p.isFree || Number(p.price) === 0;
      this.setData({
        publishType: isFree ? 'free' : 'product',
        lockedType: true,
        imageList: p.images || [],
        'form.title': p.title,
        'form.category': p.category || '',
        'form.categoryName': catObj ? catObj.name : '',
        'form.price': p.price != null ? String(p.price) : '',
        'form.originalPrice': p.originalPrice ? String(p.originalPrice) : '',
        'form.condition': p.condition || '',
        'form.description': p.description || '',
        'form.tradeMethod': p.tradeMethod || ''
      });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  onShow() {
  },

  goBack() {
    wx.navigateBack();
  },

  switchType(e) {
    if (this.data.lockedType) return;
    const type = e.currentTarget.dataset.type;
    const isLocal = type === 'local';
    this.setData({
      publishType: isLocal ? 'pet' : type,
      isLocalService: isLocal,
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

  switchLocalSub(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.publishType) return;
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

  showLocalSubPicker() {
    const types = ['宠物喂养', '山姆拼单', '家政保洁', '维修服务', '家教辅导', '其它'];
    const keys = ['pet', 'sam', 'housekeeping', 'repair', 'tutoring', 'other'];
    wx.showActionSheet({
      itemList: types,
      success: (res) => {
        const type = keys[res.tapIndex];
        if (type !== this.data.publishType) {
          this.switchLocalSub({ currentTarget: { dataset: { type } } });
        }
      }
    });
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
    const cats = ['求帮忙', '求助', '公告', '吐槽'];
    wx.showActionSheet({
      itemList: cats,
      success: (res) => {
        const cat = cats[res.tapIndex];
        this.setData({
          'form.postCategory': cat,
          publishType: cat === '求帮忙' ? 'help' : 'post'
        });
      }
    });
  },

  preventBubble() {},

  onContactPhone(e) {
    this.setData({ contactPhone: e.detail.value });
  },

  onContactWechat(e) {
    this.setData({ contactWechat: e.detail.value });
  },

  closeContactModal() {
    this.setData({ showContactModal: false });
  },

  async onContactConfirm() {
    const { contactPhone, contactWechat } = this.data;
    // 同步到个人资料
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (userInfo && userInfo.id) {
      try {
        const updateData = {};
        if (contactPhone) updateData.phone = contactPhone;
        if (contactWechat) updateData.wechatId = contactWechat;
        await api.updateUser(userInfo.id, updateData);
        // 更新本地缓存
        if (contactPhone) userInfo.phone = contactPhone;
        if (contactWechat) userInfo.wechatId = contactWechat;
        app.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
      } catch (e) {
        console.log('同步联系方式失败', e);
      }
    }
    this.setData({ showContactModal: false });
    this._contactConfirmed = true;
    this.onPublish();
  },

  async onPublish() {
    if (this._publishing) return;

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

    // 联系方式：已有则自动带入，没有则弹窗让用户选填
    if (!this._contactConfirmed) {
      const userInfo = app.globalData.userInfo || {};
      if (userInfo.wechatId) {
        this.setData({
          contactPhone: userInfo.phone || '',
          contactWechat: userInfo.wechatId || ''
        });
        this._contactConfirmed = true;
      } else {
        this.setData({
          showContactModal: true,
          contactWechat: this.data.contactWechat || ''
        });
        return;
      }
    }

    this._publishing = true;
    this._contactConfirmed = false;
    wx.showLoading({ title: this._editId ? '保存中...' : '发布中...' });
    try {
      // 区分已有远程图片和本地新图片
      const existingUrls = imageList.filter(p => p.startsWith('http'));
      const localPaths = imageList.filter(p => !p.startsWith('http'));
      let uploadedUrls = [];
      if (localPaths.length > 0) {
        uploadedUrls = await api.uploadImages(localPaths);
      }
      const imageUrls = existingUrls.concat(uploadedUrls);

      const app = getApp();
      const community = app.globalData.currentCommunity;
      const communityId = (community && community.id) || null;
      const { contactPhone, contactWechat } = this.data;

      if (publishType === 'product' || publishType === 'free') {
        const price = publishType === 'free' ? 0 : Number(form.price);
        const productData = {
          title: form.title,
          price: price,
          originalPrice: Number(form.originalPrice) || 0,
          isFree: publishType === 'free' || price === 0,
          category: form.category,
          condition: form.condition,
          images: imageUrls,
          description: form.description,
          tradeMethod: form.tradeMethod,
          communityId,
          contactPhone,
          contactWechat
        };
        if (this._editId) {
          await api.updateProduct(this._editId, productData);
        } else {
          await api.createProduct(productData);
        }
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
          communityId,
          contactPhone,
          contactWechat
        });
      } else if (publishType === 'sam') {
        const samResult = await api.createSam({
          title: form.title,
          description: form.description,
          deadline: (form.samDeadlineDate && form.samDeadlineTime) ? form.samDeadlineDate + ' ' + form.samDeadlineTime : form.samDeadlineDate || '',
          pickupMethod: form.samPickupMethod,
          minAmount: form.samMinAmount,
          targetCount: form.samTargetCount,
          communityId,
          contactPhone,
          contactWechat
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
          communityId,
          contactPhone,
          contactWechat
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
          contactPhone,
          contactWechat,
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
      } else if (['housekeeping', 'repair', 'tutoring', 'other'].indexOf(publishType) !== -1) {
        await api.createService({
          type: publishType,
          title: form.title,
          description: form.description,
          images: imageUrls,
          communityId,
          contactPhone,
          contactWechat
        });
      }

      wx.hideLoading();
      wx.showToast({ title: this._editId ? '保存成功！' : '发布成功！', icon: 'success' });
      setTimeout(() => {
        if (this._editId || this.data.lockedType) {
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
    } finally {
      this._publishing = false;
    }
  }
});
