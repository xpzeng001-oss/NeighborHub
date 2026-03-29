# 查看他人个人主页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增「他人个人主页」页面，展示用户基础信息和按类型分 Tab 的发布内容列表，并在所有详情页增加点击头像/昵称跳转入口。

**Architecture:** 新建 `pages/userProfile/userProfile` 页面，顶部信息卡片 + 横向滚动 Tab 栏 + 列表区域。复用现有 API（`getProducts`/`getPosts`/`getHelps`/`getActivities`/`getCarpools`/`getPets`/`getSams`，均支持 `userId` 筛选）。在 8 个详情页添加头像点击跳转逻辑。

**Tech Stack:** 微信小程序原生（WXML + WXSS + JS），现有 API 模块

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `pages/userProfile/userProfile.js` | 页面逻辑：加载用户信息、Tab 切换、分页加载列表 |
| Create | `pages/userProfile/userProfile.wxml` | 页面模板：信息卡片 + Tab 栏 + 列表 |
| Create | `pages/userProfile/userProfile.wxss` | 页面样式 |
| Create | `pages/userProfile/userProfile.json` | 页面配置 |
| Modify | `app.json` | 注册 userProfile 子包 |
| Modify | `pages/detail/detail.wxml` | 卖家区域点击改为跳转用户主页 |
| Modify | `pages/detail/detail.js` | 新增 `goUserProfile` 方法 |
| Modify | `pages/forumDetail/forumDetail.wxml` | 帖子头部添加点击跳转 |
| Modify | `pages/forumDetail/forumDetail.js` | 新增 `goUserProfile` 方法 |
| Modify | `pages/activityDetail/activityDetail.wxml` | 发起人区域添加点击跳转 |
| Modify | `pages/activityDetail/activityDetail.js` | 新增 `goUserProfile` 方法 |
| Modify | `pages/help/help.wxml` | 互助卡片用户区域添加点击跳转 |
| Modify | `pages/help/help.js` | 新增 `goUserProfile` 方法 |
| Modify | `pages/carpool/carpool.wxml` | 拼车卡片用户区域添加点击跳转 |
| Modify | `pages/carpool/carpool.js` | 新增 `goUserProfile` 方法 |
| Modify | `pages/petDetail/petDetail.wxml` | 发布者区域添加点击跳转 |
| Modify | `pages/petDetail/petDetail.js` | 新增 `goUserProfile` 方法 |
| Modify | `pages/samDetail/samDetail.wxml` | 发起人区域添加点击跳转 |
| Modify | `pages/samDetail/samDetail.js` | 新增 `goUserProfile` 方法 |
| Modify | `pages/chatDetail/chatDetail.wxml` | 对方头像添加点击跳转 |
| Modify | `pages/chatDetail/chatDetail.js` | 新增 `goUserProfile` 方法 |

---

### Task 1: 注册页面路由

**Files:**
- Modify: `app.json`

- [ ] **Step 1: 在 app.json 的 subPackages 中添加 userProfile**

在 `subPackages` 数组末尾（`dashboard` 之后）添加：

```json
{
  "root": "pages/userProfile",
  "pages": ["userProfile"]
}
```

- [ ] **Step 2: 创建页面目录**

```bash
mkdir -p pages/userProfile
```

- [ ] **Step 3: Commit**

```bash
git add app.json
git commit -m "feat: 注册 userProfile 页面路由"
```

---

### Task 2: 创建 userProfile 页面配置

**Files:**
- Create: `pages/userProfile/userProfile.json`

- [ ] **Step 1: 创建 userProfile.json**

```json
{
  "navigationBarTitleText": "个人主页",
  "navigationBarBackgroundColor": "#F0E4D8",
  "enablePullDownRefresh": true,
  "onReachBottomDistance": 100,
  "usingComponents": {
    "icon": "/components/icon/icon"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add pages/userProfile/userProfile.json
git commit -m "feat: 添加 userProfile 页面配置"
```

---

### Task 3: 实现 userProfile 页面逻辑

**Files:**
- Create: `pages/userProfile/userProfile.js`

- [ ] **Step 1: 创建 userProfile.js**

```javascript
const app = getApp();
const api = require('../../utils/api');

const TABS = [
  { key: 'product', name: '商品' },
  { key: 'post', name: '帖子' },
  { key: 'activity', name: '活动' },
  { key: 'help', name: '互助' },
  { key: 'carpool', name: '拼车' },
  { key: 'pet', name: '宠物' },
  { key: 'sam', name: '代购' }
];

Page({
  data: {
    userId: null,
    userInfo: null,
    notFound: false,
    tabs: TABS,
    activeTab: 'product',
    list: [],
    loading: true,
    page: 1,
    hasMore: true
  },

  onLoad(options) {
    const userId = options.userId;
    if (!userId) {
      this.setData({ notFound: true, loading: false });
      return;
    }
    this.setData({ userId: Number(userId) });
    this.loadUserInfo();
    this.loadList();
  },

  async loadUserInfo() {
    try {
      const userInfo = await api.getUser(this.data.userId);
      this.setData({ userInfo });
      wx.setNavigationBarTitle({ title: userInfo.nickName + ' 的主页' });
    } catch (err) {
      this.setData({ notFound: true, loading: false });
    }
  },

  switchTab(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeTab) return;
    this.setData({ activeTab: key, list: [], page: 1, hasMore: true });
    this.loadList();
  },

  async loadList() {
    if (this.data.loading && this.data.page > 1) return;
    this.setData({ loading: true });
    const { userId, activeTab, page } = this.data;
    const params = { userId, page, pageSize: 20 };

    try {
      let result;
      if (activeTab === 'product') {
        result = await api.getProducts(params);
      } else if (activeTab === 'post') {
        result = await api.getPosts(params);
      } else if (activeTab === 'activity') {
        result = await api.getActivities(params);
      } else if (activeTab === 'help') {
        result = await api.getHelps(params);
      } else if (activeTab === 'carpool') {
        result = await api.getCarpools(params);
      } else if (activeTab === 'pet') {
        result = await api.getPets(params);
      } else if (activeTab === 'sam') {
        result = await api.getSams(params);
      }

      const newList = result.list || [];
      this.setData({
        list: page === 1 ? newList : [...this.data.list, ...newList],
        page: page + 1,
        hasMore: newList.length >= 20,
        loading: false
      });
    } catch (err) {
      this.setData({ loading: false });
    }
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadList();
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, list: [], hasMore: true });
    Promise.all([this.loadUserInfo(), this.loadList()]).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  goDetail(e) {
    const { id, type } = e.currentTarget.dataset;
    const routes = {
      product: '/pages/detail/detail?id=',
      post: '/pages/forumDetail/forumDetail?id=',
      activity: '/pages/activityDetail/activityDetail?id=',
      help: null,
      carpool: null,
      pet: '/pages/petDetail/petDetail?id=',
      sam: '/pages/samDetail/samDetail?id='
    };
    const route = routes[type || this.data.activeTab];
    if (route) {
      wx.navigateTo({ url: route + id });
    }
  },

  onSendMessage() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      app.login();
      return;
    }
    const { userId } = this.data;
    const target = this.data.userInfo;
    wx.navigateTo({
      url: '/pages/chatDetail/chatDetail?targetUserId=' + userId +
        '&nickName=' + encodeURIComponent(target.nickName) +
        '&avatarUrl=' + encodeURIComponent(target.avatarUrl || '')
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add pages/userProfile/userProfile.js
git commit -m "feat: 实现 userProfile 页面逻辑"
```

---

### Task 4: 创建 userProfile 页面模板

**Files:**
- Create: `pages/userProfile/userProfile.wxml`

- [ ] **Step 1: 创建 userProfile.wxml**

```wxml
<view class="page">
  <!-- 用户不存在 -->
  <view class="not-found" wx:if="{{notFound}}">
    <icon name="user" size="80" color="#ddd"></icon>
    <text class="not-found-text">该用户不存在</text>
    <view class="btn-back" bindtap="goBack">返回</view>
  </view>

  <block wx:else>
    <!-- 用户信息卡片 -->
    <view class="profile-card" wx:if="{{userInfo}}">
      <image class="avatar" src="{{userInfo.avatarUrl || '/images/avatar-placeholder.png'}}" mode="aspectFill"></image>
      <view class="user-info">
        <text class="nickname">{{userInfo.nickName}}</text>
        <view class="user-meta">
          <view class="meta-item">
            <icon name="map-pin" size="24" color="#888"></icon>
            <text class="building">{{userInfo.building || '未认证楼栋'}}</text>
          </view>
          <view class="meta-item">
            <icon name="calendar" size="24" color="#888"></icon>
            <text class="join-time">{{userInfo.createdAt}} 加入</text>
          </view>
        </view>
      </view>
      <view class="btn-message" bindtap="onSendMessage">
        <icon name="message-circle" size="32" color="#fff"></icon>
        <text>发消息</text>
      </view>
    </view>

    <!-- Tab 栏 -->
    <scroll-view class="tab-bar" scroll-x enable-flex>
      <view class="tab-item {{activeTab === item.key ? 'active' : ''}}"
            wx:for="{{tabs}}" wx:key="key"
            bindtap="switchTab" data-key="{{item.key}}">
        <text>{{item.name}}</text>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty" wx:if="{{!loading && list.length === 0}}">
      <icon name="package" size="80" color="#ddd"></icon>
      <text class="empty-text">TA 还没有发布内容</text>
    </view>

    <!-- 商品列表 -->
    <view wx:if="{{activeTab === 'product'}}">
      <view class="product-item" wx:for="{{list}}" wx:key="id" bindtap="goDetail" data-id="{{item.id}}" data-type="product">
        <image class="product-img" src="{{item.images[0] || '/images/avatar-placeholder.png'}}" mode="aspectFill"></image>
        <view class="product-info">
          <text class="product-title">{{item.title}}</text>
          <view class="product-bottom">
            <text class="product-price" wx:if="{{!item.isFree}}">¥{{item.price}}</text>
            <text class="product-free" wx:else>免费送</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 帖子列表 -->
    <view wx:if="{{activeTab === 'post'}}">
      <view class="post-item" wx:for="{{list}}" wx:key="id" bindtap="goDetail" data-id="{{item.id}}" data-type="post">
        <text class="post-title">{{item.title || item.content}}</text>
        <text class="post-desc">{{item.content}}</text>
        <view class="post-footer">
          <text class="post-meta">{{item.likeCount || 0}} 赞</text>
          <text class="post-meta">{{item.commentCount || 0}} 评论</text>
          <text class="post-time">{{item.createdAt}}</text>
        </view>
      </view>
    </view>

    <!-- 活动列表 -->
    <view wx:if="{{activeTab === 'activity'}}">
      <view class="general-item" wx:for="{{list}}" wx:key="id" bindtap="goDetail" data-id="{{item.id}}" data-type="activity">
        <view class="general-header">
          <text class="general-title">{{item.title}}</text>
          <text class="general-tag {{item.status === 'open' ? 'tag-open' : 'tag-done'}}">{{item.status === 'open' ? '报名中' : '已结束'}}</text>
        </view>
        <text class="general-desc">{{item.description}}</text>
        <view class="general-footer">
          <text class="general-meta">{{item.currentCount || 0}}/{{item.maxCount || '不限'}}人</text>
          <text class="general-meta">{{item.activityTime}}</text>
        </view>
      </view>
    </view>

    <!-- 互助列表 -->
    <view wx:if="{{activeTab === 'help'}}">
      <view class="general-item" wx:for="{{list}}" wx:key="id">
        <view class="general-header">
          <text class="general-title">{{item.title}}</text>
          <text class="general-tag {{item.isUrgent ? 'tag-urgent' : 'tag-open'}}">{{item.isUrgent ? '紧急' : '一般'}}</text>
        </view>
        <text class="general-desc">{{item.description}}</text>
        <view class="general-footer">
          <text class="general-meta">{{item.responseCount || 0}}人响应</text>
        </view>
      </view>
    </view>

    <!-- 拼车列表 -->
    <view wx:if="{{activeTab === 'carpool'}}">
      <view class="general-item" wx:for="{{list}}" wx:key="id">
        <view class="general-header">
          <text class="general-title">{{item.title}}</text>
          <text class="general-tag {{item.type === 'offer' ? 'tag-open' : 'tag-need'}}">{{item.type === 'offer' ? '有车带人' : '找车搭乘'}}</text>
        </view>
        <text class="general-desc">{{item.from}} → {{item.to}}</text>
        <view class="general-footer">
          <text class="general-meta">{{item.date}} {{item.time}}</text>
          <text class="general-meta">{{item.fee || '免费'}}</text>
        </view>
      </view>
    </view>

    <!-- 宠物列表 -->
    <view wx:if="{{activeTab === 'pet'}}">
      <view class="general-item" wx:for="{{list}}" wx:key="id" bindtap="goDetail" data-id="{{item.id}}" data-type="pet">
        <view class="general-header">
          <text class="general-title">{{item.title}}</text>
          <text class="general-tag {{item.type === 'need' ? 'tag-need' : item.type === 'offer' ? 'tag-open' : 'tag-social'}}">{{item.type === 'need' ? '寻求喂养' : item.type === 'offer' ? '可以帮喂' : '宠物社交'}}</text>
        </view>
        <text class="general-desc">{{item.description}}</text>
        <view class="general-footer">
          <text class="general-meta" wx:if="{{item.petName}}">{{item.petName}}</text>
          <text class="general-meta">{{item.responseCount || 0}}人响应</text>
        </view>
      </view>
    </view>

    <!-- 代购列表 -->
    <view wx:if="{{activeTab === 'sam'}}">
      <view class="general-item" wx:for="{{list}}" wx:key="id" bindtap="goDetail" data-id="{{item.id}}" data-type="sam">
        <view class="general-header">
          <text class="general-title">{{item.title}}</text>
          <text class="general-tag {{item.status === 'open' ? 'tag-open' : 'tag-done'}}">{{item.status === 'open' ? '拼单中' : item.status === 'full' ? '已成团' : '已结束'}}</text>
        </view>
        <text class="general-desc">{{item.description}}</text>
        <view class="general-footer">
          <text class="general-meta">{{item.currentCount || 0}}/{{item.targetCount || 5}}人</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-more" wx:if="{{loading && list.length > 0}}">
      <text>加载中...</text>
    </view>
    <view class="loading-more" wx:if="{{!hasMore && list.length > 0}}">
      <text>没有更多了</text>
    </view>
  </block>
</view>
```

- [ ] **Step 2: Commit**

```bash
git add pages/userProfile/userProfile.wxml
git commit -m "feat: 创建 userProfile 页面模板"
```

---

### Task 5: 创建 userProfile 页面样式

**Files:**
- Create: `pages/userProfile/userProfile.wxss`

- [ ] **Step 1: 创建 userProfile.wxss**

```css
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F0E4D8 0%, #FAF8F4 300rpx);
}

/* 用户不存在 */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 400rpx;
  gap: 20rpx;
}
.not-found-text { font-size: 28rpx; color: #9A9A9A; }
.btn-back {
  margin-top: 40rpx;
  padding: 16rpx 64rpx;
  background: #C67A52;
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
}

/* 用户信息卡片 */
.profile-card {
  display: flex;
  align-items: center;
  padding: 40rpx 32rpx 32rpx;
  gap: 24rpx;
}
.avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.1);
  background: #E5E2DC;
  flex-shrink: 0;
}
.user-info {
  flex: 1;
  min-width: 0;
}
.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #2C2C2C;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-meta {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}
.building, .join-time {
  font-size: 24rpx;
  color: #9A9A9A;
}
.btn-message {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 28rpx;
  background: #C67A52;
  color: #fff;
  font-size: 26rpx;
  border-radius: 40rpx;
  flex-shrink: 0;
  font-weight: 500;
}
.btn-message:active { opacity: 0.8; }

/* Tab 栏 */
.tab-bar {
  white-space: nowrap;
  background: #fff;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.tab-item {
  display: inline-flex;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: #9A9A9A;
  position: relative;
}
.tab-item.active {
  color: #2C2C2C;
  font-weight: 600;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background: #C67A52;
  border-radius: 3rpx;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
  gap: 20rpx;
}
.empty-text { font-size: 28rpx; color: #9A9A9A; }

/* 商品列表 */
.product-item {
  display: flex;
  padding: 24rpx 28rpx;
  margin: 16rpx 32rpx 0;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.product-item:active { background: #FEFCFA; }
.product-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #FEFCFA;
  margin-right: 24rpx;
}
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.product-title {
  font-size: 28rpx;
  color: #2C2C2C;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}
.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-price { font-size: 32rpx; color: #C67A52; font-weight: 700; }
.product-free { font-size: 26rpx; color: #D49A78; font-weight: 600; }

/* 帖子列表 */
.post-item {
  padding: 28rpx;
  margin: 16rpx 32rpx 0;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.post-item:active { background: #FEFCFA; }
.post-title {
  font-size: 30rpx;
  color: #2C2C2C;
  font-weight: 600;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 12rpx;
}
.post-desc {
  font-size: 26rpx;
  color: #9A9A9A;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
  margin-bottom: 12rpx;
}
.post-footer {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.post-meta { font-size: 22rpx; color: #BDBDBD; }
.post-time { font-size: 22rpx; color: #BDBDBD; margin-left: auto; }

/* 通用列表项（活动/互助/拼车/宠物/代购） */
.general-item {
  padding: 28rpx;
  margin: 16rpx 32rpx 0;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.general-item:active { background: #FEFCFA; }
.general-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}
.general-title {
  font-size: 30rpx;
  color: #2C2C2C;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.general-tag {
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
  font-weight: 500;
}
.tag-open { background: #F3E8DA; color: #C67A52; }
.tag-done { background: #E3D5BF; color: #9A9A9A; }
.tag-need { background: rgba(232, 136, 60, 0.1); color: #E8883C; }
.tag-urgent { background: rgba(232, 99, 111, 0.08); color: #E8636F; }
.tag-social { background: rgba(139, 109, 176, 0.1); color: #8B6DB0; }
.general-desc {
  font-size: 26rpx;
  color: #9A9A9A;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
  margin-bottom: 12rpx;
}
.general-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.general-meta { font-size: 22rpx; color: #9A9A9A; }

/* 加载更多 */
.loading-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 24rpx;
  color: #9A9A9A;
}
```

- [ ] **Step 2: Commit**

```bash
git add pages/userProfile/userProfile.wxss
git commit -m "feat: 创建 userProfile 页面样式"
```

---

### Task 6: 商品详情页（detail）添加跳转入口

**Files:**
- Modify: `pages/detail/detail.wxml`
- Modify: `pages/detail/detail.js`

- [ ] **Step 1: 修改 detail.wxml — 卖家区域改为跳转用户主页**

将卖家区域的 `bindtap="viewSeller"` 改为 `bindtap="goUserProfile"`：

```wxml
<!-- 卖家信息 -->
<view class="section seller-section" bindtap="goUserProfile">
```

- [ ] **Step 2: 修改 detail.js — 新增 goUserProfile 方法**

在 `viewSeller` 方法附近添加 `goUserProfile` 方法：

```javascript
goUserProfile() {
  const app = getApp();
  const userId = this.data.product.userId;
  if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
    wx.switchTab({ url: '/pages/mine/mine' });
  } else {
    wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
  }
},
```

- [ ] **Step 3: Commit**

```bash
git add pages/detail/detail.wxml pages/detail/detail.js
git commit -m "feat: 商品详情页添加跳转用户主页入口"
```

---

### Task 7: 帖子详情页（forumDetail）添加跳转入口

**Files:**
- Modify: `pages/forumDetail/forumDetail.wxml`
- Modify: `pages/forumDetail/forumDetail.js`

- [ ] **Step 1: 修改 forumDetail.wxml — 帖子头部添加点击**

给 `post-header` 添加 `bindtap`：

```wxml
<view class="post-header" bindtap="goUserProfile">
```

- [ ] **Step 2: 修改 forumDetail.js — 新增 goUserProfile 方法**

```javascript
goUserProfile() {
  const app = getApp();
  const userId = this.data.post.userId;
  if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
    wx.switchTab({ url: '/pages/mine/mine' });
  } else {
    wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
  }
},
```

- [ ] **Step 3: Commit**

```bash
git add pages/forumDetail/forumDetail.wxml pages/forumDetail/forumDetail.js
git commit -m "feat: 帖子详情页添加跳转用户主页入口"
```

---

### Task 8: 活动详情页（activityDetail）添加跳转入口

**Files:**
- Modify: `pages/activityDetail/activityDetail.wxml`
- Modify: `pages/activityDetail/activityDetail.js`

- [ ] **Step 1: 修改 activityDetail.wxml — 发起人区域添加点击**

将 `organizer-card` 拆分，给头像+信息区域加独立的点击（保留原有的私信按钮）：

找到：
```wxml
<view class="organizer-card">
  <image class="organizer-avatar" src="{{detail.userAvatar || '/images/avatar-placeholder.png'}}" mode="aspectFill"></image>
  <view class="organizer-info">
    <text class="organizer-name">{{detail.userName}}</text>
    <text class="organizer-label">活动发起人</text>
  </view>
```

改为：
```wxml
<view class="organizer-card">
  <view class="organizer-left" bindtap="goUserProfile">
    <image class="organizer-avatar" src="{{detail.userAvatar || '/images/avatar-placeholder.png'}}" mode="aspectFill"></image>
    <view class="organizer-info">
      <text class="organizer-name">{{detail.userName}}</text>
      <text class="organizer-label">活动发起人</text>
    </view>
  </view>
```

在私信按钮的 `</view>` 之后的 `</view>` 保持不变。需要在 `organizer-left` 加样式：

在 `activityDetail.wxss` 中添加：
```css
.organizer-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}
```

- [ ] **Step 2: 修改 activityDetail.js — 新增 goUserProfile 方法**

```javascript
goUserProfile() {
  const app = getApp();
  const userId = this.data.detail.userId;
  if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
    wx.switchTab({ url: '/pages/mine/mine' });
  } else {
    wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
  }
},
```

- [ ] **Step 3: Commit**

```bash
git add pages/activityDetail/activityDetail.wxml pages/activityDetail/activityDetail.js pages/activityDetail/activityDetail.wxss
git commit -m "feat: 活动详情页添加跳转用户主页入口"
```

---

### Task 9: 互助页面（help）添加跳转入口

**Files:**
- Modify: `pages/help/help.wxml`
- Modify: `pages/help/help.js`

- [ ] **Step 1: 修改 help.wxml — 用户区域添加点击**

给 `help-user` 添加 `catchtap`（用 `catchtap` 避免冒泡到卡片）：

```wxml
<view class="help-user" catchtap="goUserProfile" data-user-id="{{item.userId}}">
```

- [ ] **Step 2: 修改 help.js — 新增 goUserProfile 方法**

```javascript
goUserProfile(e) {
  const app = getApp();
  const userId = e.currentTarget.dataset.userId;
  if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
    wx.switchTab({ url: '/pages/mine/mine' });
  } else {
    wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
  }
},
```

- [ ] **Step 3: Commit**

```bash
git add pages/help/help.wxml pages/help/help.js
git commit -m "feat: 互助页面添加跳转用户主页入口"
```

---

### Task 10: 拼车页面（carpool）添加跳转入口

**Files:**
- Modify: `pages/carpool/carpool.wxml`
- Modify: `pages/carpool/carpool.js`

- [ ] **Step 1: 修改 carpool.wxml — 用户区域添加点击**

给 `card-header` 中的头像和用户信息区域加点击。将：

```wxml
<view class="card-header">
  <image class="avatar" src="{{item.userAvatar || '/images/avatar-placeholder.png'}}" mode="aspectFill"></image>
  <view class="user-info">
    <text class="user-name">{{item.userName}}</text>
    <text class="user-building">{{item.building}}</text>
  </view>
  <text class="time">{{item.createdAt}}</text>
</view>
```

改为：

```wxml
<view class="card-header">
  <view class="card-user" catchtap="goUserProfile" data-user-id="{{item.userId}}">
    <image class="avatar" src="{{item.userAvatar || '/images/avatar-placeholder.png'}}" mode="aspectFill"></image>
    <view class="user-info">
      <text class="user-name">{{item.userName}}</text>
      <text class="user-building">{{item.building}}</text>
    </view>
  </view>
  <text class="time">{{item.createdAt}}</text>
</view>
```

在 `carpool.wxss` 中添加：
```css
.card-user {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}
```

- [ ] **Step 2: 修改 carpool.js — 新增 goUserProfile 方法**

```javascript
goUserProfile(e) {
  const app = getApp();
  const userId = e.currentTarget.dataset.userId;
  if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
    wx.switchTab({ url: '/pages/mine/mine' });
  } else {
    wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
  }
},
```

- [ ] **Step 3: Commit**

```bash
git add pages/carpool/carpool.wxml pages/carpool/carpool.js pages/carpool/carpool.wxss
git commit -m "feat: 拼车页面添加跳转用户主页入口"
```

---

### Task 11: 宠物详情页（petDetail）添加跳转入口

**Files:**
- Modify: `pages/petDetail/petDetail.wxml`
- Modify: `pages/petDetail/petDetail.js`

- [ ] **Step 1: 修改 petDetail.wxml — 发布者区域添加点击**

给 `author-row` 添加 `bindtap`：

```wxml
<view class="author-row" bindtap="goUserProfile">
```

- [ ] **Step 2: 修改 petDetail.js — 新增 goUserProfile 方法**

```javascript
goUserProfile() {
  const app = getApp();
  const userId = this.data.detail.userId;
  if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
    wx.switchTab({ url: '/pages/mine/mine' });
  } else {
    wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
  }
},
```

- [ ] **Step 3: Commit**

```bash
git add pages/petDetail/petDetail.wxml pages/petDetail/petDetail.js
git commit -m "feat: 宠物详情页添加跳转用户主页入口"
```

---

### Task 12: 代购详情页（samDetail）添加跳转入口

**Files:**
- Modify: `pages/samDetail/samDetail.wxml`
- Modify: `pages/samDetail/samDetail.js`

- [ ] **Step 1: 修改 samDetail.wxml — 发起人区域添加点击**

给 `author-row` 添加 `bindtap`：

```wxml
<view class="author-row" bindtap="goUserProfile">
```

- [ ] **Step 2: 修改 samDetail.js — 新增 goUserProfile 方法**

```javascript
goUserProfile() {
  const app = getApp();
  const userId = this.data.detail.userId;
  if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
    wx.switchTab({ url: '/pages/mine/mine' });
  } else {
    wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
  }
},
```

- [ ] **Step 3: Commit**

```bash
git add pages/samDetail/samDetail.wxml pages/samDetail/samDetail.js
git commit -m "feat: 代购详情页添加跳转用户主页入口"
```

---

### Task 13: 聊天详情页（chatDetail）添加跳转入口

**Files:**
- Modify: `pages/chatDetail/chatDetail.wxml`
- Modify: `pages/chatDetail/chatDetail.js`

- [ ] **Step 1: 修改 chatDetail.wxml — 对方头像添加点击**

给对方消息中的头像添加 `catchtap`：

找到：
```wxml
<view class="msg-item msg-left" wx:if="{{item.senderId !== myUserId}}">
  <image class="msg-avatar" src="{{targetAvatarUrl || '/images/avatar-placeholder.png'}}" mode="aspectFill"></image>
```

改为：
```wxml
<view class="msg-item msg-left" wx:if="{{item.senderId !== myUserId}}">
  <image class="msg-avatar" src="{{targetAvatarUrl || '/images/avatar-placeholder.png'}}" mode="aspectFill" catchtap="goUserProfile"></image>
```

- [ ] **Step 2: 修改 chatDetail.js — 新增 goUserProfile 方法**

```javascript
goUserProfile() {
  const app = getApp();
  const userId = this.data.targetUserId;
  if (app.globalData.userInfo && Number(userId) === app.globalData.userInfo.id) {
    wx.switchTab({ url: '/pages/mine/mine' });
  } else {
    wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
  }
},
```

- [ ] **Step 3: Commit**

```bash
git add pages/chatDetail/chatDetail.wxml pages/chatDetail/chatDetail.js
git commit -m "feat: 聊天详情页添加跳转用户主页入口"
```

---

### Task 14: 广场页面（category）feed 列表添加跳转入口

**Files:**
- Modify: `pages/category/category.wxml`
- Modify: `pages/category/category.js`

- [ ] **Step 1: 修改 category.wxml — feed 头像区域添加点击**

给 feed 卡片中的头像添加 `catchtap`（用 `catchtap` 避免冒泡到卡片整体的 `bindtap="goDetail"`）：

找到：
```wxml
<view class="feed-header">
    <image class="feed-avatar" src="{{item.userAvatar || '/images/avatar-placeholder.png'}}" mode="aspectFill"></image>
```

改为：
```wxml
<view class="feed-header">
    <image class="feed-avatar" src="{{item.userAvatar || '/images/avatar-placeholder.png'}}" mode="aspectFill" catchtap="goUserProfile" data-user-id="{{item.userId}}"></image>
```

- [ ] **Step 2: 修改 category.js — 新增 goUserProfile 方法**

```javascript
goUserProfile(e) {
  const app = getApp();
  const userId = e.currentTarget.dataset.userId;
  if (app.globalData.userInfo && userId === app.globalData.userInfo.id) {
    wx.switchTab({ url: '/pages/mine/mine' });
  } else {
    wx.navigateTo({ url: '/pages/userProfile/userProfile?userId=' + userId });
  }
},
```

- [ ] **Step 3: Commit**

```bash
git add pages/category/category.wxml pages/category/category.js
git commit -m "feat: 广场页面添加跳转用户主页入口"
```
