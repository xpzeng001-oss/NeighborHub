# 广场"本地群聊" Tab 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在广场页 Tab 栏"帖子"前新增"本地群聊" Tab，展示微信群二维码卡片，仅管理员可 CRUD。

**Architecture:** 新增 WechatGroup Sequelize 模型，新增独立 REST 路由 `/api/wechat-groups`，广场页新增 Tab 通过独立接口加载群列表，不改动 feed 接口。

**Tech Stack:** Node.js + Express + Sequelize (后端), 微信小程序原生 (前端)

---

## 文件清单

| 操作 | 文件 | 职责 |
|------|------|------|
| 创建 | `server/models/WechatGroup.js` | 数据模型定义 |
| 修改 | `server/models/index.js` | 注册模型 + 关联关系 |
| 创建 | `server/routes/wechatGroups.js` | REST 路由 (CRUD) |
| 修改 | `server/routes/index.js` | 挂载路由 |
| 修改 | `utils/api.js` | 前端 API 函数 |
| 修改 | `pages/category/category.js` | Tab + 数据加载逻辑 |
| 修改 | `pages/category/category.wxml` | 群卡片模板 |
| 修改 | `pages/category/category.wxss` | 群卡片样式 |

---

### Task 1: 创建 WechatGroup 模型

**Files:**
- Create: `server/models/WechatGroup.js`
- Modify: `server/models/index.js`

- [ ] **Step 1: 创建模型文件**

创建 `server/models/WechatGroup.js`：

```js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WechatGroup = sequelize.define('WechatGroup', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(256),
    defaultValue: ''
  },
  qrcode_url: {
    type: DataTypes.STRING(512),
    allowNull: false
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  created_by: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  district_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'wechat_groups'
});

module.exports = WechatGroup;
```

- [ ] **Step 2: 注册模型和关联关系**

在 `server/models/index.js` 顶部 require 区域，在 `const ServicePost = require('./ServicePost');` 之后添加：

```js
const WechatGroup = require('./WechatGroup');
```

在文件末尾 `module.exports` 之前添加关联：

```js
// User <-> WechatGroup
User.hasMany(WechatGroup, { foreignKey: 'created_by' });
WechatGroup.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// District <-> WechatGroup
District.hasMany(WechatGroup, { foreignKey: 'district_id' });
WechatGroup.belongsTo(District, { foreignKey: 'district_id' });
```

在 `module.exports` 对象中添加 `WechatGroup`。

- [ ] **Step 3: 验证模型同步**

```bash
cd /Users/Personal-xp/NeighborHub/server && node -e "
const { sequelize, WechatGroup } = require('./models');
sequelize.sync({ alter: true }).then(() => {
  console.log('WechatGroup table synced');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
"
```

Expected: `WechatGroup table synced`

- [ ] **Step 4: Commit**

```bash
git add server/models/WechatGroup.js server/models/index.js
git commit -m "feat: add WechatGroup model for local group chat entries"
```

---

### Task 2: 创建后端路由

**Files:**
- Create: `server/routes/wechatGroups.js`
- Modify: `server/routes/index.js`

- [ ] **Step 1: 创建路由文件**

创建 `server/routes/wechatGroups.js`：

```js
const router = require('express').Router();
const { auth, optionalAuth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/admin');
const { WechatGroup, User } = require('../models');

// GET / — 公开列表
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const where = { status: 'active' };
    if (req.query.districtId) {
      where.district_id = req.query.districtId;
    }
    const list = await WechatGroup.findAll({
      where,
      order: [['sort_order', 'DESC'], ['createdAt', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['id', 'nickname', 'avatar'] }]
    });
    res.json({ code: 0, data: { list } });
  } catch (err) {
    next(err);
  }
});

// POST / — 管理员创建
router.post('/', auth, adminAuth, async (req, res, next) => {
  try {
    const { name, description, qrcode_url, sort_order, district_id } = req.body;
    if (!name || !qrcode_url) {
      return res.status(400).json({ code: 400, message: '群名称和二维码不能为空' });
    }
    const group = await WechatGroup.create({
      name,
      description: description || '',
      qrcode_url,
      sort_order: sort_order || 0,
      district_id: district_id || null,
      created_by: req.user.id
    });
    res.json({ code: 0, data: group });
  } catch (err) {
    next(err);
  }
});

// PUT /:id — 管理员编辑
router.put('/:id', auth, adminAuth, async (req, res, next) => {
  try {
    const group = await WechatGroup.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ code: 404, message: '群聊不存在' });
    }
    const { name, description, qrcode_url, sort_order, status, district_id } = req.body;
    await group.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(qrcode_url !== undefined && { qrcode_url }),
      ...(sort_order !== undefined && { sort_order }),
      ...(status !== undefined && { status }),
      ...(district_id !== undefined && { district_id })
    });
    res.json({ code: 0, data: group });
  } catch (err) {
    next(err);
  }
});

// DELETE /:id — 管理员删除
router.delete('/:id', auth, adminAuth, async (req, res, next) => {
  try {
    const group = await WechatGroup.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ code: 404, message: '群聊不存在' });
    }
    await group.destroy();
    res.json({ code: 0, data: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 2: 注册路由**

在 `server/routes/index.js` 的 `router.use('/admin'` 行之前添加：

```js
router.use('/wechat-groups', require('./wechatGroups'));
```

- [ ] **Step 3: 启动服务验证路由**

```bash
cd /Users/Personal-xp/NeighborHub/server && node -e "
const app = require('./app');
const server = app.listen(3001, () => {
  console.log('Server started on 3001');
  const http = require('http');
  http.get('http://localhost:3001/api/wechat-groups', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => { console.log('GET /api/wechat-groups:', data); server.close(); });
  });
});
"
```

Expected: 返回 `{"code":0,"data":{"list":[]}}`

- [ ] **Step 4: Commit**

```bash
git add server/routes/wechatGroups.js server/routes/index.js
git commit -m "feat: add wechat-groups REST API with admin-only CRUD"
```

---

### Task 3: 前端 API 函数

**Files:**
- Modify: `utils/api.js`

- [ ] **Step 1: 添加 API 函数**

在 `utils/api.js` 中，在 `const getFeed` 行之后添加：

```js
// Wechat Groups
const getWechatGroups    = (params)     => request({ url: '/api/wechat-groups', data: params });
const createWechatGroup  = (data)       => request({ url: '/api/wechat-groups', method: 'POST', data });
const updateWechatGroup  = (id, data)   => request({ url: '/api/wechat-groups/' + id, method: 'PUT', data });
const deleteWechatGroup  = (id)         => request({ url: '/api/wechat-groups/' + id, method: 'DELETE' });
```

在 `module.exports` 对象中添加这四个函数：

```js
getWechatGroups, createWechatGroup, updateWechatGroup, deleteWechatGroup,
```

- [ ] **Step 2: Commit**

```bash
git add utils/api.js
git commit -m "feat: add wechat-groups API functions in frontend"
```

---

### Task 4: 广场页新增"本地群聊" Tab + 数据加载

**Files:**
- Modify: `pages/category/category.js`

- [ ] **Step 1: 添加 Tab 项**

在 `pages/category/category.js` 顶部的 `TABS` 数组中，在 `{ id: 'local', name: '本地服务' }` 和 `{ id: 'post', name: '帖子' }` 之间插入：

```js
{ id: 'wechat_group', name: '本地群聊' },
```

最终 TABS 为：

```js
const TABS = [
  { id: 'all', name: '全部' },
  { id: 'product', name: '闲置' },
  { id: 'activity', name: '活动' },
  { id: 'local', name: '本地服务' },
  { id: 'wechat_group', name: '本地群聊' },
  { id: 'post', name: '帖子' }
];
```

- [ ] **Step 2: data 中增加群聊列表字段**

在 Page data 中添加：

```js
groupList: [],
```

- [ ] **Step 3: switchTab 方法中处理群聊 Tab**

修改 `switchTab` 方法，切换 Tab 时根据类型加载不同数据：

```js
switchTab(e) {
  const id = e.currentTarget.dataset.id;
  if (id === this.data.activeTab) return;
  this.setData({ activeTab: id, feedList: [], groupList: [], page: 1, hasMore: true });
  if (id === 'wechat_group') {
    this.loadGroups();
  } else {
    this.loadFeed(true);
  }
},
```

- [ ] **Step 4: 添加 loadGroups 方法**

在 `loadFeed` 方法之后添加：

```js
async loadGroups() {
  try {
    const app = getApp();
    const district = app.globalData.currentDistrict;
    const params = {};
    if (district && district.id) params.districtId = district.id;
    const data = await api.getWechatGroups(params);
    this.setData({ groupList: data.list || [] });
  } catch (e) {
    console.error('[plaza] load groups failed', e);
  }
},
```

- [ ] **Step 5: 添加预览群码方法**

在 `loadGroups` 之后添加：

```js
onPreviewQrcode(e) {
  const url = e.currentTarget.dataset.url;
  wx.previewImage({ current: url, urls: [url] });
},
```

- [ ] **Step 6: onShow 和 onRefresh 中处理群聊 Tab**

修改 `onShow`：

```js
onShow() {
  if (typeof this.getTabBar === 'function' && this.getTabBar()) {
    this.getTabBar().setData({ selected: 1 });
  }
  if (this.data.activeTab === 'wechat_group') {
    this.loadGroups();
  } else {
    this.loadFeed(true);
  }
},
```

修改 `onRefresh`：

```js
async onRefresh() {
  this.setData({ isRefreshing: true });
  if (this.data.activeTab === 'wechat_group') {
    await this.loadGroups();
  } else {
    await this.loadFeed(true);
  }
  this.setData({ isRefreshing: false });
},
```

- [ ] **Step 7: Commit**

```bash
git add pages/category/category.js
git commit -m "feat: add wechat_group tab with data loading in plaza page"
```

---

### Task 5: 广场页群聊卡片模板

**Files:**
- Modify: `pages/category/category.wxml`

- [ ] **Step 1: 添加群聊列表模板**

在 `category.wxml` 中，在 `<view class="feed-list">` 之前（`<scroll-view>` 内部开头），添加群聊列表模板：

```xml
<!-- 本地群聊列表 -->
<view class="group-list" wx:if="{{activeTab === 'wechat_group'}}">
  <view class="group-card" wx:for="{{groupList}}" wx:key="id"
        bindtap="onPreviewQrcode" data-url="{{item.qrcode_url}}">
    <image class="group-qrcode" src="{{item.qrcode_url}}" mode="aspectFill"></image>
    <view class="group-info">
      <text class="group-name">{{item.name}}</text>
      <text class="group-desc" wx:if="{{item.description}}">{{item.description}}</text>
      <text class="group-hint">点击查看二维码，长按保存加群</text>
    </view>
  </view>
  <view class="feed-empty" wx:if="{{groupList.length === 0}}">
    <icon name="users" size="96" color="#ccc"></icon>
    <text>暂无群聊</text>
  </view>
</view>
```

- [ ] **Step 2: feed-list 在群聊 Tab 时隐藏**

将现有的 `<view class="feed-list">` 添加条件：

```xml
<view class="feed-list" wx:if="{{activeTab !== 'wechat_group'}}">
```

同样，底部的空状态和加载更多也加条件，将：

```xml
<view class="feed-empty" wx:if="{{feedList.length === 0 && !isRefreshing}}">
```

改为：

```xml
<view class="feed-empty" wx:if="{{activeTab !== 'wechat_group' && feedList.length === 0 && !isRefreshing}}">
```

将：

```xml
<view class="load-more" wx:if="{{feedList.length > 0 && !hasMore}}">
```

改为：

```xml
<view class="load-more" wx:if="{{activeTab !== 'wechat_group' && feedList.length > 0 && !hasMore}}">
```

- [ ] **Step 3: Commit**

```bash
git add pages/category/category.wxml
git commit -m "feat: add wechat group card template in plaza page"
```

---

### Task 6: 群聊卡片样式

**Files:**
- Modify: `pages/category/category.wxss`

- [ ] **Step 1: 添加群聊卡片样式**

在 `category.wxss` 文件末尾添加：

```css
/* 本地群聊 */
.group-list {
  padding: 12rpx 24rpx;
}
.group-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}
.group-qrcode {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  margin-right: 24rpx;
  background: #F0EDE8;
}
.group-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.group-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #2C2C2C;
}
.group-desc {
  font-size: 24rpx;
  color: #666;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.group-hint {
  font-size: 22rpx;
  color: #C67A52;
}
```

- [ ] **Step 2: Commit**

```bash
git add pages/category/category.wxss
git commit -m "feat: add wechat group card styles"
```

---

### Task 7: 端到端验证

- [ ] **Step 1: 启动后端服务**

```bash
cd /Users/Personal-xp/NeighborHub/server && npm run dev
```

- [ ] **Step 2: 用 curl 创建测试数据（以管理员身份）**

先获取管理员 token，然后：

```bash
curl -X POST http://localhost:3000/api/wechat-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"name":"闲置群","description":"小区闲置物品交换","qrcode_url":"https://example.com/qr1.png","sort_order":10}'
```

Expected: 返回 `{"code":0,"data":{...}}`

- [ ] **Step 3: 验证列表接口**

```bash
curl http://localhost:3000/api/wechat-groups
```

Expected: 返回包含刚创建的群聊记录

- [ ] **Step 4: 微信开发者工具验证前端**

1. 打开微信开发者工具，编译项目
2. 进入广场页，确认 Tab 栏显示：全部 | 闲置 | 活动 | 本地服务 | 本地群聊 | 帖子
3. 点击"本地群聊" Tab，确认显示群卡片
4. 点击群卡片，确认弹出二维码大图预览

- [ ] **Step 5: 最终 Commit**

确认一切正常后，如果有遗漏修改：

```bash
git add -A && git commit -m "feat: wechat group tab complete"
```
