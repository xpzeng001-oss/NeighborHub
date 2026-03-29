# 查看他人个人主页 - 设计文档

## 概述

在 NeighborHub 小程序中新增「他人个人主页」页面，用户可以从任何展示用户头像/昵称的地方点击进入，查看该用户的基础信息和所有类型的发布内容。

## 页面结构

### 顶部 - 用户信息卡片

- 头像（大尺寸，圆形）
- 昵称
- 楼栋认证信息（已认证显示楼栋号，未认证显示「未认证」）
- 注册时间（格式：YYYY-MM-DD 加入）
- 「发消息」按钮

### 中部 - Tab 栏

按内容类型分 Tab 切换，每个 Tab 显示对应数量：

- 商品（products）
- 帖子（posts）
- 活动（activities）
- 互助（helps）
- 拼车（carpools）
- 宠物（pets）
- 代购（sams）

数量为 0 的 Tab 仍然显示，列表为空时展示空状态提示。

### 下部 - 列表区域

- 复用现有各类型列表的展示样式（与首页/分类页一致）
- 支持滚动加载分页
- 点击列表项跳转到对应详情页

## 技术方案

### 新增页面

- 路径：`pages/userProfile/userProfile`
- 传参：`?userId=xx`
- 在 `app.json` 的 `subpackages` 中注册

### API 调用

- 用户信息：`GET /api/users/{userId}`
- 商品列表：`GET /api/products?userId={userId}`
- 帖子列表：`GET /api/posts?userId={userId}`
- 活动列表：`GET /api/activities?userId={userId}`
- 互助列表：`GET /api/helps?userId={userId}`
- 拼车列表：`GET /api/carpools?userId={userId}`
- 宠物列表：`GET /api/pets?userId={userId}`
- 代购列表：`GET /api/sams?userId={userId}`

各 API 已支持 userId 筛选参数，无需后端改动。

### 发消息功能

点击「发消息」按钮：
- 跳转到 `pages/chatDetail/chatDetail?targetUserId={userId}`
- 复用现有聊天逻辑

### 入口改造

在以下页面中，给用户头像/昵称区域添加点击事件，跳转到 `userProfile` 页面：

- 商品详情页（detail）
- 帖子详情页（forumDetail）
- 活动详情页（activityDetail）
- 互助详情页（help）
- 拼车页面（carpool）
- 宠物详情页（petDetail）
- 代购详情页（samDetail）
- 聊天详情页（chatDetail）

**自己判断逻辑**：点击时判断 userId 是否等于当前登录用户的 id，如果是则跳转到「我的」页面（`wx.switchTab` 到 mine），否则跳转到 `userProfile`。

### 样式设计

- 沿用现有设计语言：暖色调（#C67A52, #F0E4D8, #FAF8F4）
- 信息卡片样式参考 mine 页面的 profile-card
- Tab 栏使用横向滚动，当前选中 Tab 使用 #C67A52 高亮
- 列表样式复用现有各类型列表组件的样式

## 边界情况

- 用户不存在：显示提示「该用户不存在」并提供返回按钮
- 未登录用户点击「发消息」：触发登录流程
- 所有 Tab 内容为空：显示空状态占位图 + 文案「TA 还没有发布内容」
