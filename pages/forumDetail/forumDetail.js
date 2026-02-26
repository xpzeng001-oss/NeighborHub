// pages/forumDetail/forumDetail.js
const api = require('../../utils/api');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    post: {},
    comments: [],
    commentText: '',
    isLiked: false
  },

  async onLoad(options) {
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
