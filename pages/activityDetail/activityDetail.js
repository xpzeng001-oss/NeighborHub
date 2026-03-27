// pages/activityDetail/activityDetail.js
const api = require('../../utils/api');

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function formatActivityTime(timeStr) {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return timeStr;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = WEEKDAYS[d.getDay()];
  const h = ('0' + d.getHours()).slice(-2);
  const m = ('0' + d.getMinutes()).slice(-2);
  return month + '月' + day + '日 ' + weekday + ' ' + h + ':' + m;
}

Page({
  data: {
    statusBarHeight: 44,
    detail: null,
    showJoinModal: false,
    joinForm: { name: '', phone: '', idCard: '' }
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
    this.activityId = options.id;
    this.loadDetail();
  },

  goBack() {
    wx.navigateBack();
  },

  async loadDetail() {
    try {
      const data = await api.getActivityDetail(this.activityId);
      data.startTimeFormatted = formatActivityTime(data.startTime);
      data.endTimeFormatted = formatActivityTime(data.endTime);
      data.participantAvatars = data.participantAvatars || [];
      data.images = data.images || [];
      this.setData({ detail: data });
    } catch (e) {
      console.error('[activityDetail] load failed', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async onJoin() {
    if (this._submitting) return;
    const { detail } = this.data;
    if (!detail) return;
    if (detail.isOrganizer) return;

    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this._submitting = true;
    try {
      // 已报名则取消
      if (detail.isJoined) {
        const confirmRes = await new Promise(resolve => {
          wx.showModal({ title: '取消报名', content: '确定要取消报名吗？', success: resolve });
        });
        if (!confirmRes.confirm) return;
        const result = await api.cancelActivity(this.activityId);
        wx.showToast({ title: '已取消报名', icon: 'success' });
        this.setData({
          'detail.isJoined': false,
          'detail.currentParticipants': result.currentParticipants,
          'detail.status': result.status
        });
        return;
      }

      if (detail.status !== 'open') return;
      // 弹出报名表单
      this.setData({ showJoinModal: true, joinForm: { name: '', phone: '', idCard: '' } });
    } catch (e) {
      console.error('[activityDetail] cancel failed', e);
    } finally {
      this._submitting = false;
    }
  },

  onJoinInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`joinForm.${field}`]: e.detail.value });
  },

  closeJoinModal() {
    this.setData({ showJoinModal: false });
  },

  async submitJoin() {
    const { joinForm } = this.data;
    if (!joinForm.name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!joinForm.phone.trim() || joinForm.phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    if (this._submitting) return;
    this._submitting = true;
    try {
      const result = await api.joinActivity(this.activityId);
      this.setData({
        showJoinModal: false,
        'detail.isJoined': true,
        'detail.currentParticipants': result.currentParticipants,
        'detail.status': result.status
      });
      wx.showToast({ title: '报名成功！', icon: 'success' });

      // 发送报名信息给发起人
      const { detail } = this.data;
      if (detail && detail.userId) {
        try {
          const userInfo = getApp().globalData.userInfo;
          const senderName = userInfo ? userInfo.nickName : '用户';
          let msg = `${senderName}报名了「${detail.title}」\n姓名：${joinForm.name}\n手机：${joinForm.phone}`;
          if (joinForm.idCard.trim()) msg += `\n身份证：${joinForm.idCard}`;
          const convRes = await api.createConversation({ targetUserId: detail.userId });
          await api.sendMessage(convRes.id, { content: msg });
        } catch (e) {
          console.error('发送报名信息失败', e);
        }
      }
    } catch (e) {
      console.error('[activityDetail] join failed', e);
    } finally {
      this._submitting = false;
    }
  },

  onChat() {
    const { detail } = this.data;
    if (!detail) return;
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?userId=' + detail.userId + '&userName=' + detail.userName
    });
  },

  async onDelete() {
    if (this._submitting) return;
    const res = await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个活动吗？',
        success: resolve
      });
    });
    if (!res.confirm) return;

    this._submitting = true;
    try {
      await api.deleteActivity(this.activityId);
      wx.showToast({ title: '已删除', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      console.error('[activityDetail] delete failed', e);
    } finally {
      this._submitting = false;
    }
  },

  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: this.data.detail.images
    });
  },

  onShare() {
    // Trigger share
  },

  onShareAppMessage() {
    const { detail } = this.data;
    return {
      title: detail ? detail.title : '一起参加活动吧',
      path: '/pages/activityDetail/activityDetail?id=' + this.activityId
    };
  }
});
