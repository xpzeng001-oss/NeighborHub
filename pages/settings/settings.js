const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    avatarUrl: '',
    nickName: '',
    community: '',
    communityIndex: 0,
    building: '',
    buildingIndex: 0,
    communities: [],
    buildings: ['1栋', '2栋', '3栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '12栋'],
    saving: false,
    tempAvatarPath: '',
    avatarBase: '',
    avatarCount: 0,
    currentAvatarIndex: 0
  },

  async onLoad() {
    // 每次打开都重新拉取最新小区列表
    let communities = app.globalData.communities || [];
    try {
      const data = await api.getCommunities();
      const list = data.list || data;
      if (list && list.length > 0) {
        communities = list;
        app.globalData.communities = list;
      }
    } catch (e) {}
    this.setData({ communities });

    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      const community = userInfo.community || userInfo.communityName || '';
      const building = userInfo.building || '';
      const communityIndex = Math.max(0, communities.findIndex(c => c.name === community));
      const buildingIndex = Math.max(0, this.data.buildings.indexOf(building));

      this.setData({
        avatarUrl: userInfo.avatarUrl || userInfo.avatar_url || '',
        nickName: userInfo.nickName || userInfo.nick_name || '',
        community,
        communityIndex,
        building,
        buildingIndex
      });
    }

    // 解析头像库配置
    const FALLBACK_BASE = 'https://xpzeng-1318589271.cos.ap-guangzhou.myqcloud.com/neighborhub/avatars';
    const avatarUrl = this.data.avatarUrl;
    const match = avatarUrl && avatarUrl.match(/^(.+\/neighborhub\/avatars)\/(\d+)\.png$/);
    this.setData({
      avatarBase: match ? match[1] : FALLBACK_BASE,
      avatarCount: 117,
      currentAvatarIndex: match ? parseInt(match[2], 10) : 0
    });
  },

  // 点击头像 → 从手机相册选照片
  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        this.setData({ avatarUrl: tempPath, tempAvatarPath: tempPath });
      }
    });
  },

  // 点击"切换默认头像" → 循环切换服务器上的默认头像
  switchDefaultAvatar() {
    const { avatarBase, avatarCount, currentAvatarIndex } = this.data;
    if (!avatarBase || !avatarCount) return;

    const nextIndex = (currentAvatarIndex % avatarCount) + 1;
    const newUrl = `${avatarBase}/${nextIndex}.png`;

    this.setData({
      currentAvatarIndex: nextIndex,
      avatarUrl: newUrl,
      tempAvatarPath: ''  // 清除手机照片临时路径
    });
  },

  goApplyCommunity() {
    wx.navigateTo({ url: '/pages/communityApply/communityApply' });
  },

  onNicknameInput(e) {
    this.setData({ nickName: e.detail.value });
  },

  onCommunityChange(e) {
    const idx = e.detail.value;
    const community = this.data.communities[idx];
    this.setData({ communityIndex: idx, community: community.name });
  },

  onBuildingChange(e) {
    const idx = e.detail.value;
    this.setData({ buildingIndex: idx, building: this.data.buildings[idx] });
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.userInfo = null;
          app.globalData.token = '';
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.switchTab({ url: '/pages/mine/mine' });
        }
      }
    });
  },

  async onSave() {
    const { nickName, tempAvatarPath, saving } = this.data;
    if (saving) return;

    if (!nickName.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    this.setData({ saving: true });

    try {
      let avatarUrl = this.data.avatarUrl;

      // 如果选了手机照片，先上传到 COS
      if (tempAvatarPath) {
        avatarUrl = await api.uploadImage(tempAvatarPath);
      }

      const { community, building } = this.data;
      const userInfo = app.globalData.userInfo;
      const updated = await api.updateUser(userInfo.id, {
        nickName: nickName.trim(),
        avatarUrl,
        building,
        isVerified: !!building
      });

      const newUserInfo = {
        ...userInfo,
        nickName: updated.nickName || nickName.trim(),
        nick_name: updated.nickName || nickName.trim(),
        avatarUrl: updated.avatarUrl || avatarUrl,
        avatar_url: updated.avatarUrl || avatarUrl,
        community,
        building: updated.building || building,
        isVerified: !!building
      };
      app.globalData.userInfo = newUserInfo;
      wx.setStorageSync('userInfo', newUserInfo);

      // 设置当前小区并自动关联社区
      const selectedCommunity = this.data.communities[this.data.communityIndex];
      if (selectedCommunity) {
        app.globalData.currentCommunity = selectedCommunity;
        wx.setStorageSync('currentCommunity', selectedCommunity);
        const districts = app.globalData.districts || [];
        const parentDistrict = districts.find(d =>
          d.communities && d.communities.some(c => c.id === selectedCommunity.id)
        );
        if (parentDistrict) {
          app.globalData.currentDistrict = parentDistrict;
          wx.setStorageSync('currentDistrict', parentDistrict);
        }
      }

      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => { wx.navigateBack(); }, 1000);
    } catch (err) {
      console.error('保存失败', err);
    } finally {
      this.setData({ saving: false });
    }
  }
});
