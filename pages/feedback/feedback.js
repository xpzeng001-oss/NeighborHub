// pages/feedback/feedback.js
const api = require('../../utils/api');

Page({
  data: {
    type: '功能建议',
    content: '',
    contact: '',
    submitting: false
  },

  onTypeChange(e) {
    this.setData({ type: e.currentTarget.dataset.type });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  async onSubmit() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请填写反馈内容', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    try {
      await api.createFeedback({
        type: this.data.type,
        content: this.data.content.trim(),
        contact: this.data.contact.trim()
      });

      wx.showToast({ title: '感谢您的反馈', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      console.log('提交反馈失败', err);
    } finally {
      this.setData({ submitting: false });
    }
  }
});