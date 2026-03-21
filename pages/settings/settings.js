const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    avatarUrl: '',
    nickName: '',
    saving: false,
    avatarBase: '',
    avatarCount: 0,
    currentAvatarIndex: 0
  },

  onLoad() {
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({
        avatarUrl: userInfo.avatarUrl || userInfo.avatar_url || '',
        nickName: userInfo.nickName || userInfo.nick_name || ''
      });
    }

    // 从 globalData 获取头像库配置
    const config = app.globalData.avatarConfig;
    if (config) {
      let currentIndex = 0;
      const avatarUrl = this.data.avatarUrl;
      if (avatarUrl && avatarUrl.includes('/neighborhub/avatars/')) {
        const match = avatarUrl.match(/\/(\d+)\.png$/);
        if (match) currentIndex = parseInt(match[1], 10);
      }
      this.setData({
        avatarBase: config.baseUrl,
        avatarCount: config.count,
        currentAvatarIndex: currentIndex
      });
    }
  },

  chooseAvatar() {
    const { avatarBase, avatarCount, currentAvatarIndex } = this.data;
    if (!avatarBase || !avatarCount) return;

    // 循环切换到下一张
    const nextIndex = (currentAvatarIndex % avatarCount) + 1;
    const newUrl = `${avatarBase}/${nextIndex}.png`;

    this.setData({
      currentAvatarIndex: nextIndex,
      avatarUrl: newUrl
    });
  },

  onNicknameInput(e) {
    this.setData({ nickName: e.detail.value });
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
    const { nickName, saving } = this.data;
    if (saving) return;

    if (!nickName.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    this.setData({ saving: true });

    try {
      const avatarUrl = this.data.avatarUrl;
      const userInfo = app.globalData.userInfo;
      const updated = await api.updateUser(userInfo.id, {
        nickName: nickName.trim(),
        avatarUrl
      });

      // 同步更新本地存储
      const newUserInfo = {
        ...userInfo,
        nickName: updated.nickName || nickName.trim(),
        nick_name: updated.nickName || nickName.trim(),
        avatarUrl: updated.avatarUrl || avatarUrl,
        avatar_url: updated.avatarUrl || avatarUrl
      };
      app.globalData.userInfo = newUserInfo;
      wx.setStorageSync('userInfo', newUserInfo);

      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => { wx.navigateBack(); }, 1000);
    } catch (err) {
      console.error('保存失败', err);
    } finally {
      this.setData({ saving: false });
    }
  }
});
