// pages/forumDetail/forumDetail.js
const { mockPosts } = require('../../utils/mockData');
const { formatTime } = require('../../utils/util');

Page({
  data: {
    post: {},
    comments: [
      { id: 'c1', userName: '3栋业主', content: '支持物业，提前通知就行', time: '2小时前' },
      { id: 'c2', userName: '新搬来的小陈', content: '请问大概几点开始维保？', time: '1小时前' }
    ],
    commentText: '',
    isLiked: false
  },

  onLoad(options) {
    const id = options.id;
    const post = mockPosts.find(p => p.id === id) || mockPosts[0];
    this.setData({
      post: { ...post, timeAgo: formatTime(new Date(post.createdAt)) }
    });
    wx.setNavigationBarTitle({ title: post.title.substring(0, 12) });
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  onLike() {
    const post = this.data.post;
    const isLiked = !this.data.isLiked;
    post.likeCount += isLiked ? 1 : -1;
    this.setData({ isLiked, post });
  },

  onSend() {
    if (!this.data.commentText.trim()) {
      wx.showToast({ title: '请输入评论', icon: 'none' });
      return;
    }
    const comments = this.data.comments;
    comments.push({
      id: 'c' + Date.now(),
      userName: '我',
      content: this.data.commentText,
      time: '刚刚'
    });
    const post = this.data.post;
    post.commentCount += 1;
    this.setData({ comments, commentText: '', post });
    wx.showToast({ title: '评论成功', icon: 'success' });
  }
});
