const api = require('../../utils/api');

const TABS = [
  { id: 'all', name: '全部' },
  { id: 'activity', name: '活动' },
  { id: 'product', name: '闲置' },
  { id: 'post', name: '帖子' },
  { id: 'help', name: '互助' },
  { id: 'pet', name: '宠物' },
  { id: 'sam', name: '拼单' },
  { id: 'carpool', name: '拼车' }
];

const TYPE_LABELS = {
  product: '闲置', post: '帖子', help: '互助', rental: '租赁',
  pet: '宠物', sam: '拼单', carpool: '拼车', activity: '活动'
};

const TYPE_COLORS = {
  product: '#C67A52', post: '#4A90D9', help: '#E8883C', rental: '#D4A04A',
  pet: '#8B6DB0', sam: '#4A90D9', carpool: '#C67A52', activity: '#4CD964'
};

const formatTime = d => {
  const df = Date.now() - d;
  if (df < 60000) return '刚刚';
  if (df < 3600000) return Math.floor(df / 60000) + '分钟前';
  if (df < 86400000) return Math.floor(df / 3600000) + '小时前';
  if (df < 604800000) return Math.floor(df / 86400000) + '天前';
  const m = d.getMonth() + 1, day = d.getDate();
  return (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
};

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const formatActivityTime = t => {
  if (!t) return '';
  const d = new Date(t);
  if (isNaN(d.getTime())) return t;
  return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + WEEKDAYS[d.getDay()] + ' ' +
    ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
};

Page({
  data: {
    statusBarHeight: 44,
    tabs: TABS,
    activeTab: 'all',
    feedList: [],
    isRefreshing: false,
    hasMore: true,
    page: 1
  },

  onLoad() {
    const menuRect = wx.getMenuButtonBoundingClientRect();
    this.setData({ statusBarHeight: menuRect.top });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.loadFeed(true);
  },

  switchTab(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activeTab) return;
    this.setData({ activeTab: id, feedList: [], page: 1, hasMore: true });
    this.loadFeed(true);
  },

  async loadFeed(reset) {
    try {
      const app = getApp();
      const district = app.globalData.currentDistrict;
      const page = reset ? 1 : this.data.page;
      const params = { type: this.data.activeTab, page, pageSize: 20 };
      if (district && district.id) params.districtId = district.id;

      const data = await api.getFeed(params);
      const userInfo = app.globalData.userInfo;
      const myId = userInfo ? userInfo.id : null;
      const items = (data.list || []).map(item => ({
        ...item,
        typeLabel: TYPE_LABELS[item.feedType] || '',
        typeColor: TYPE_COLORS[item.feedType] || '#999',
        timeAgo: formatTime(new Date(item.createdAt)),
        startTimeFormatted: item.feedType === 'activity' ? formatActivityTime(item.startTime) : '',
        endTimeFormatted: item.feedType === 'activity' ? formatActivityTime(item.endTime) : '',
        participantAvatars: item.participantAvatars || [],
        isJoined: item.feedType === 'activity' && myId ? (item.participantIds || []).includes(myId) : false,
        isOwner: item.feedType === 'activity' && myId ? item.userId === myId : false
      }));

      if (reset) {
        this.setData({ feedList: items, page: 2, hasMore: items.length >= 20 });
      } else {
        this.setData({
          feedList: this.data.feedList.concat(items),
          page: page + 1,
          hasMore: items.length >= 20
        });
      }
    } catch (e) {
      console.error('[plaza] load failed', e);
    }
  },

  async onRefresh() {
    this.setData({ isRefreshing: true });
    await this.loadFeed(true);
    this.setData({ isRefreshing: false });
  },

  onLoadMore() {
    if (this.data.hasMore) this.loadFeed(false);
  },

  onShareAppMessage() {
    const uid = getApp().globalData.userInfo ? getApp().globalData.userInfo.id : '';
    return {
      title: '来邻里广场看看吧',
      path: '/pages/index/index?inviter=' + uid
    };
  },

  onJoinActivity(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/activityDetail/activityDetail?id=' + id });
  },

  goUserProfile(e) {
    const app = getApp();
    const userId = e.currentTarget.dataset.userId;
    if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
      wx.switchTab({ url: '/pages/mine/mine' });
    } else {
      wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
    }
  },

  goDetail(e) {
    const { type, id } = e.currentTarget.dataset;
    const routes = {
      product: '/pages/detail/detail?id=',
      post: '/pages/forumDetail/forumDetail?id=',
      help: '/pages/help/help',
      rental: '/pages/rental/rental',
      pet: '/pages/petDetail/petDetail?id=',
      sam: '/pages/samDetail/samDetail?id=',
      carpool: '/pages/carpool/carpool',
      activity: '/pages/activityDetail/activityDetail?id='
    };
    const url = routes[type];
    if (!url) return;
    wx.navigateTo({ url: url.includes('?') ? url + id : url });
  }
});
