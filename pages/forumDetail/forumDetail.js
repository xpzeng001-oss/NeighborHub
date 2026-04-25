// pages/forumDetail/forumDetail.js
const api = require('../../utils/api');
function callWithMask(phone) {
  if (!phone) return;
  const masked = phone.length >= 7 ? phone.substring(0,3)+'****'+phone.substring(phone.length-4) : phone;
  wx.showModal({ title:'电话联系', content:'确认拨打 '+masked+' ？', confirmText:'拨打', confirmColor:'#C67A52',
    success(res){ if(res.confirm) wx.makePhoneCall({ phoneNumber: phone }); } });
}
const formatTime = d => { const df = Date.now() - d; if (df < 60000) return '刚刚'; if (df < 3600000) return Math.floor(df/60000)+'分钟前'; if (df < 86400000) return Math.floor(df/3600000)+'小时前'; if (df < 604800000) return Math.floor(df/86400000)+'天前'; const m = d.getMonth()+1, day = d.getDate(); return d.getFullYear()+'-'+(m<10?'0'+m:m)+'-'+(day<10?'0'+day:day); };

Page({
  data: {
    post: {},
    comments: [],
    commentText: '',
    isLiked: false,
    myAvatar: ''
  },

  async onLoad(options) {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({ myAvatar: app.globalData.userInfo.avatarUrl || '' });
    }
    const id = options.id;
    try {
      const post = await api.getPost(id);
      this.setData({
        post: { ...post, timeAgo: formatTime(new Date(post.createdAt)) },
        comments: (post.comments || []).map(c => ({
          ...c,
          time: formatTime(new Date(c.createdAt))
        }))
      });
      wx.setNavigationBarTitle({ title: post.title.substring(0, 12) });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  async onLike() {
    try {
      const data = await api.likePost(this.data.post.id);
      const post = this.data.post;
      post.likeCount = data.likeCount;
      this.setData({ isLiked: true, post });
    } catch (err) {
      wx.showToast({ title: '请先登录', icon: 'none' });
    }
  },

  goUserProfile() {
    const app = getApp();
    const userId = this.data.post.userId;
    if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
      wx.switchTab({ url: '/pages/mine/mine' });
    } else {
      wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
    }
  },

  focusComment() {
    wx.pageScrollTo({ selector: '.comment-input-row', duration: 300 });
  },

  onShareAppMessage() {
    const p = this.data.post;
    return {
      title: p.title || '来看看这篇帖子',
      path: '/pages/forumDetail/forumDetail?id=' + p.id,
      imageUrl: (p.images && p.images.length > 0) ? p.images[0] : ''
    };
  },

  onChat() {
    const app = getApp();
    const p = this.data.post;
    if (!p || !p.userId) return;
    if (!app.globalData.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + p.userId +
        '&nickName=' + encodeURIComponent(p.userName || '') +
        '&avatarUrl=' + encodeURIComponent(p.userAvatar || '')
    });
  },

  onCopyWechat() {
    wx.setClipboardData({
      data: this.data.post.contactWechat,
      success: () => wx.showToast({ title: '微信号已复制，去微信添加好友', icon: 'none' })
    });
  },

  onCallPhone() {
    callWithMask(this.data.post.contactPhone);
  },

  async onSend() {
    if (!this.data.commentText.trim()) {
      wx.showToast({ title: '请输入评论', icon: 'none' });
      return;
    }
    try {
      const comment = await api.addComment(this.data.post.id, { content: this.data.commentText });
      const comments = this.data.comments;
      comments.push({ ...comment, time: '刚刚' });
      const post = this.data.post;
      post.commentCount += 1;
      this.setData({ comments, commentText: '', post });
      wx.showToast({ title: '评论成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '请先登录', icon: 'none' });
    }
  }
});
