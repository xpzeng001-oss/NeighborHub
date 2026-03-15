const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    name: '',
    address: '',
    reason: '',
    contact: '',
    submitting: false,
    myApplications: []
  },

  onLoad() {
    this.loadMyApplications();
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },
  onAddressInput(e) {
    this.setData({ address: e.detail.value });
  },
  onReasonInput(e) {
    this.setData({ reason: e.detail.value });
  },
  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  async onSubmit() {
    if (this.data.submitting) return;
    const { name, address, reason, contact } = this.data;
    if (!name.trim()) {
      wx.showToast({ title: '请输入小区名称', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      await api.applyCommunity({
        name: name.trim(),
        address: address.trim(),
        reason: reason.trim(),
        contact: contact.trim()
      });
      wx.showToast({ title: '申请已提交', icon: 'success' });
      this.setData({ name: '', address: '', reason: '', contact: '' });
      this.loadMyApplications();
    } catch (err) {
      // error toast handled by api.js
    }
    this.setData({ submitting: false });
  },

  async loadMyApplications() {
    try {
      const data = await api.getMyCommunityApplications();
      this.setData({ myApplications: data.list || [] });
    } catch (err) {
      // ignore
    }
  }
});
