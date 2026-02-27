const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    conversationId: null,
    targetUserId: null,
    targetNickName: '',
    targetAvatarUrl: '',
    messages: [],
    inputValue: '',
    scrollToView: '',
    myUserId: null
  },

  _timer: null,
  _lastMsgId: 0,

  async onLoad(options) {
    const userInfo = app.globalData.userInfo;
    this.setData({
      targetUserId: Number(options.targetUserId),
      targetNickName: decodeURIComponent(options.nickName || ''),
      targetAvatarUrl: decodeURIComponent(options.avatarUrl || ''),
      myUserId: userInfo ? userInfo.id : null
    });

    wx.setNavigationBarTitle({ title: this.data.targetNickName || '聊天' });

    // 获取或创建会话
    if (options.conversationId) {
      this.setData({ conversationId: Number(options.conversationId) });
    } else {
      try {
        const res = await api.createConversation({ targetUserId: this.data.targetUserId });
        this.setData({ conversationId: res.id });
      } catch (err) {
        wx.showToast({ title: '无法建立会话', icon: 'none' });
        return;
      }
    }

    await this.loadMessages();
    this.markRead();
  },

  onShow() {
    this.startPolling();
  },

  onHide() {
    this.stopPolling();
  },

  onUnload() {
    this.stopPolling();
  },

  startPolling() {
    this.stopPolling();
    this._timer = setInterval(() => {
      this.pollNewMessages();
    }, 5000);
  },

  stopPolling() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  async loadMessages() {
    if (!this.data.conversationId) return;
    try {
      const res = await api.getMessages(this.data.conversationId, { pageSize: 50 });
      const messages = res.list || [];
      if (messages.length > 0) {
        this._lastMsgId = messages[messages.length - 1].id;
      }
      this.setData({ messages });
      this.scrollToBottom();
    } catch (err) {
      console.log('加载消息失败', err);
    }
  },

  async pollNewMessages() {
    if (!this.data.conversationId) return;
    try {
      const res = await api.getMessages(this.data.conversationId, { afterId: this._lastMsgId });
      const newMsgs = res.list || [];
      if (newMsgs.length > 0) {
        this._lastMsgId = newMsgs[newMsgs.length - 1].id;
        this.setData({
          messages: [...this.data.messages, ...newMsgs]
        });
        this.scrollToBottom();
        this.markRead();
      }
    } catch (err) {}
  },

  async markRead() {
    if (!this.data.conversationId) return;
    try {
      await api.markConversationRead(this.data.conversationId);
    } catch (err) {}
  },

  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  async onSend() {
    const content = this.data.inputValue.trim();
    if (!content) return;

    // 立即追加到消息列表
    const tempMsg = {
      id: Date.now(),
      senderId: this.data.myUserId,
      content: content,
      createdAt: new Date().toISOString(),
      senderAvatar: app.globalData.userInfo ? app.globalData.userInfo.avatarUrl : ''
    };

    this.setData({
      messages: [...this.data.messages, tempMsg],
      inputValue: ''
    });
    this.scrollToBottom();

    try {
      const res = await api.sendMessage(this.data.conversationId, { content });
      // 更新临时消息的 id
      const messages = this.data.messages;
      const idx = messages.findIndex(m => m.id === tempMsg.id);
      if (idx !== -1) {
        messages[idx].id = res.id;
        this._lastMsgId = res.id;
        this.setData({ messages });
      }
    } catch (err) {
      wx.showToast({ title: '发送失败', icon: 'none' });
    }
  },

  scrollToBottom() {
    setTimeout(() => {
      this.setData({ scrollToView: 'msg-bottom' });
    }, 100);
  }
});
