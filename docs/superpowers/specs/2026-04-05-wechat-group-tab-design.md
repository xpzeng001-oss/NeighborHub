# 广场新增"本地群聊" Tab

## 概述

在广场页 Tab 栏的"帖子"前面新增"本地群聊" Tab，用于展示微信群二维码入口，帮助沉淀私域用户。仅管理员可发布和编辑。

## 前端改动

### Tab 栏

文件：`pages/category/category.js`

TABS 常量新增一项，插在 `post` 之前：

```js
{ id: 'wechat_group', name: '本地群聊' }
```

最终顺序：全部 | 闲置 | 活动 | 本地服务 | 本地群聊 | 帖子

### 群聊列表展示

当 `activeTab === 'wechat_group'` 时：
- 调用 `GET /api/wechat-groups?districtId=xxx` 获取列表
- 不走 feed 接口，走独立接口
- 卡片样式：群名 + 群简介 + 群二维码缩略图
- 点击卡片 → `wx.previewImage` 预览群二维码大图（用户长按保存后扫码加群）
- 不显示发布按钮（普通用户无权限）

### API 工具函数

文件：`utils/api.js`

新增：
- `getWechatGroups(params)` — GET /api/wechat-groups
- `createWechatGroup(data)` — POST /api/wechat-groups
- `updateWechatGroup(id, data)` — PUT /api/wechat-groups/:id
- `deleteWechatGroup(id)` — DELETE /api/wechat-groups/:id

## 后端改动

### 新增模型：WechatGroup

文件：`server/models/WechatGroup.js`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER, PK, AUTO | 主键 |
| name | STRING, NOT NULL | 群名称（如"闲置群"） |
| description | STRING | 群简介 |
| qrcodeUrl | STRING, NOT NULL | 群码图片 URL |
| sortOrder | INTEGER, DEFAULT 0 | 排序权重，越大越靠前 |
| status | ENUM('active','inactive'), DEFAULT 'active' | 状态 |
| createdBy | INTEGER, FK -> User.id | 创建者（管理员） |
| districtId | INTEGER, FK -> District.id | 所属社区 |

### 模型关联

文件：`server/models/index.js`

- `WechatGroup.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' })`
- `WechatGroup.belongsTo(District, { foreignKey: 'districtId' })`

### 新增路由：/api/wechat-groups

文件：`server/routes/wechatGroups.js`

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | / | 公开（optionalAuth） | 列表，按 districtId 过滤，按 sortOrder DESC 排序 |
| POST | / | admin | 创建 |
| PUT | /:id | admin | 编辑（更新群码等） |
| DELETE | /:id | admin | 删除 |

### 路由注册

文件：`server/routes/index.js`

新增：`router.use('/wechat-groups', require('./wechatGroups'))`

## 不做的事

- 不改动 feed 接口
- 不改动 Tab 顺序（广场仍为第二个 Tab）
- 不做应用内群聊
- 不新增管理后台页面（管理员通过 API 管理，后续可加 UI）
