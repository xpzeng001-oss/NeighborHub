const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    avatarUrl: '',
    nickName: '',
    saving: false,
    tempAvatarPath: ''
  },

  onLoad() {
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({
        avatarUrl: userInfo.avatarUrl || userInfo.avatar_url || '',
        nickName: userInfo.nickName || userInfo.nick_name || ''
      });
    }
  },

  chooseAvatar() {
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

  onNicknameInput(e) {
    this.setData({ nickName: e.detail.value });
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

      // 如果选了新头像，先上传到 COS
      if (tempAvatarPath) {
        avatarUrl = await api.uploadImage(tempAvatarPath);
      }

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
