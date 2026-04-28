# 13 — Conlaboro MVP 上线规划文档

> **文档目的**: 明确 MVP 上线前已完成功能、待修复项和待开发项，指导开发优先级
> **基于**: `12-项目设计哲学文档.md` + 全代码库评估 (2026-04-28)
> **适用范围**: MVP 发布前开发冲刺、QA 验收清单

---

## 一、项目现状总览

| 维度 | 状态 | 完成度 |
|------|------|--------|
| 前端页面 | 14 个页面全部实现 | **95%** |
| 前端组件 | 核心组件完整 | **90%** |
| 后端 API | 11 个 Controller 覆盖全业务 | **92%** |
| 数据库 | 8 版迁移，16 张表 | **100%** |
| 游戏化体系 | XP + 徽章 + 等级全自动 | **95%** |
| E2E 测试 | Playwright 4 个 spec 文件 | **70%** |

**技术栈**: React 18 + Vite + CSS Modules (前端) | Spring Boot 3 + MyBatis-Plus + PostgreSQL + JWT (后端)

---

## 二、已完成功能清单（可验收）

### 2.1 用户系统 ✅

| 功能 | 实现细节 | 关键文件 |
|------|---------|----------|
| 邮箱注册 | 昵称+邮箱+密码(≥6位)+角色标签选择，JWT 自动登录 | `RegisterPage.jsx` → `AuthService.register()` |
| 邮箱登录 | JWT Token 认证，localStorage 持久化，请求拦截器自动附 Bearer | `LoginPage.jsx`, `api/request.js` |
| 登出 | 清除 localStorage + 跳转首页 | `Navbar.jsx:55-56` |
| 个人主页 | 头像(首字母色块) / 等级 / XP / 徽章墙 / 技能条 / 参与项目列表 | `ProfilePage.jsx` |
| 编辑昵称 | 弹窗编辑 → `PUT /users/profile` | `SettingsPage.jsx:228-244` |
| 编辑简介 | 弹窗编辑，200 字限制，实时字数统计 | `SettingsPage.jsx:245-265` |
| 技能标签 | 21 种预设技能，最多选 6 个，先删后重建写入 user_skills 表 | `SettingsPage.jsx:268-290` |
| 等级体系 | 7 级自动晋升（新社员→创客→建设者→骨干→引领者→先驱→传奇） | `UserService.java:30-31,149-174` |
| XP 积累 | 评论(+5)/认领(+5)/完成任务(可配置)/里程碑完成(+30)/项目完成(+50) | `ProjectService.java:140-148,165-173,201-217,296-306` |
| 徽章系统 | 17 种预置徽章，7 种自动触发器，授予即更新 badge_count | `BadgeAutoService.java`, `V2__Seed_data.sql` |

### 2.2 项目系统 ✅

| 功能 | 实现细节 | 关键文件 |
|------|---------|----------|
| 项目创建 | 三步表单（基本信息→团队角色配置→里程碑规划）+ AI 辅助分析（关键词匹配分类/角色/里程碑） | `CreatePage.jsx` → `ProjectController.create()` |
| 项目列表 | 全部项目卡片展示，搜索(名称/描述/角色)，类别筛选，状态筛选 | `HomePage.jsx`, `RecruitingProjectsPage.jsx` |
| 项目详情 | Hero 区 / 描述 / 贡献热力图 / 任务看板 / 协作空间 / 里程碑 CRUD / 团队成员 / 侧边栏 | `DetailPage.jsx` (415 行) |
| 里程碑管理 | 创建 / 在线编辑 / 删除，状态流转 (open→current→done) | `DetailPage.jsx:79-112`, `ProjectService.java:263-322` |
| 任务看板 | 三列布局（待认领 / 进行中 / 已完成），按里程碑分组 | `TaskBoard.jsx`, `TaskCard.jsx`, `AddCard.jsx` |
| 任务操作 | 创建任务（关联里程碑）/ 认领任务 / 释放任务 | `ProjectController.java:101-152` |
| 项目编辑 | 发起人可编辑标题/描述/类别/周期/状态 | `ProjectEditModal.jsx` → `ProjectController.updateProject()` |
| 申请加入 | 选择角色 + 自我介绍弹窗 → 申请审批流 | `JoinModal.jsx` → `ApplicationService.java` |
| 审批申请 | 发起人查看列表 → 通过/拒绝 → 通过时自动授「第一把火」徽章 | `ApplicationService.java:87-112` |
| 收藏功能 | 切换收藏 / 检查收藏状态 | `FavoriteController.java`, `FavoriteService.java` |
| 项目动态 | 活动 Feed（创建任务/认领任务/评论等），按时间倒序 | `DetailPage.jsx:307-319`, `ActivityService.java` |

### 2.3 协作系统 ✅

| 功能 | 实现细节 | 关键文件 |
|------|---------|----------|
| 评论讨论 | 三 Tab（讨论 / 文件 / 项目日志），发送评论获 XP+5 | `CollabSpace.jsx`, `ProjectController.addComment()` |
| 文件展示 | 文件列表展示（名称/上传者/时间），下载箭头 UI | `CollabSpace.jsx:65-77` |
| 通知面板 | 下拉面板 / 未读角标 / 通知列表 / 单条已读 / 全部标已读 | `NotificationPanel.jsx`, `NotificationService.java` |
| 贡献热力图 | GitHub 风格热力图，支持时间范围切换(1M/3M/6M/1Y)和贡献者筛选 | `ContributionHeatmap.jsx` (367 行) |

### 2.4 游戏化系统 ✅

| 功能 | 实现细节 | 关键文件 |
|------|---------|----------|
| 排行榜 | 展示页（🥇🥈🥉 领奖台 + 列表），按 XP 排序 | `LeaderboardPage.jsx`, `LeaderboardService.java` |
| 成果展厅 | 已完成项目展示（精选 + 网格列表） | `ShowcasePage.jsx` |
| Dashboard | 个人荣誉栏 / 徽章墙(已解锁/总数) / 我的项目 / 能力图谱(技能进度条) | `DashboardPage.jsx` |
| 徽章详情弹窗 | 点击徽章显示名称/图标/系列/描述/条件 | `BadgeModal.jsx` |

### 2.5 想法墙系统 ✅

| 功能 | 实现细节 | 关键文件 |
|------|---------|----------|
| 想法列表 | 分页加载(每页20) + 无限滚动，搜索 + 三种排序(最新/最热/最多评论) | `IdeaWallPage.jsx`, `IdeaService.getIdeasPage()` |
| 发布想法 | FAB 按钮 → Modal 输入框 → POST /ideas | `IdeaWallPage.jsx:86-100` |
| 点赞互动 | 登录用户可点赞/取消点赞，实时更新计数 | `IdeaWallPage.jsx:102-122` |
| 想法详情 | 内容 / 作者信息 / 点赞状态 / 评论区(分页+发表评论) | `IdeaDetailPage.jsx` |
| 孵化路径 | 「转化为项目」按钮 → 导航到 CreatePage 并携带 ideaContent state | `IdeaWallPage.jsx:124-126`, `CreatePage.jsx:70-76` |

---

## 三、待修复问题（Bug 清单）

### P0 — 必须修复（影响核心流程）

| # | 问题 | 位置 | 修复方案 |
|---|------|------|----------|
| B-01 | **评论发送后不刷新列表** | `CollabSpace.jsx:22` 有 `TODO: 刷新评论列表` | 发送成功后调用 `onCommented` 回调刷新 DetailPage 数据 |
| B-02 | **想法发布 authorName 写死** | `IdeaWallPage.jsx:91` 写死 `'已登录用户'` / `'匿名用户'` | 从 `currentUser.name` 取真实用户名，未登录保持匿名 |
| B-03 | **收藏按钮使用 showToast 模拟** | `DetailPage.jsx:168` `showToast('已收藏该项目', 'info')` | 调用 `toggleFavorite(p.id)` 真实 API |
| B-04 | **Fork 按钮仅 showToast** | `DetailPage.jsx:168` `showToast('已 Fork 该项目')` | 暂隐藏或实现复制项目逻辑 |

### P1 — 应当修复（影响体验完整性）

| # | 问题 | 位置 | 修复方案 |
|---|------|------|----------|
| B-05 | **ProfilePage 参与项目过滤过于宽泛** | `ProfilePage.jsx:39` `roles.length > 0` 匹配所有有角色的项目 | 改为检查 roles 中 members 包含当前用户名 |
| B-06 | **Dashboard 贡献记录为空态** | `DashboardPage.jsx:141-146` 硬编码空消息 | 调用 `getMyActivities()` 填充真实活动数据 |
| B-07 | **Leaderboard 多 Tab 无数据区分** | `LeaderboardPage.jsx:12` 有 4 种 tab 但全部用 xp 排序 | 后端 `getLeaderboard(sort)` 支持 weekly/monthly/badges 排序 |
| B-08 | **Settings 角色偏好不持久化** | `SettingsPage.jsx:160-186` UI 存在但无保存调用 | 新增 `updatePreferences` API 或在 `updateProfile` 中扩展字段 |
| B-09 | **通知设置开关不持久化** | `SettingsPage.jsx:191-203` ToggleSwitch 状态未保存 | 同上，扩展 user preferences 表或字段 |
| B-10 | **隐私设置开关不持久化** | `SettingsPage.jsx:206-218` 同上 | 同上 |
| B-11 | **HomePage 创客数用估算值** | `HomePage.jsx:22` `Math.max(totalProjects * 4, ...)` | 使用 `statsData.totalUsers` 真实值（已有 fallback） |

### P2 — 可以后续优化

| # | 问题 | 说明 |
|---|------|------|
| B-12 | DashboardPage.jsx:47 有重复 className attribute | `<button>` 上同时出现两个 className 属性 |
| B-13 | IdeaWallPage/IdeaDetailPage 使用全局 CSS 类名而非 CSS Modules | `.idea-hero`, `.idea-search-input` 等 |
| B-14 | DetailPage 大量使用全局 CSS 类名 | `.detail-page`, `.detail-hero`, `.task-board` 等 |
| B-15 | ContributionHeatmap 使用内联 `<style>` 而非 CSS Modules | 组件内部 126 行内联样式 |

---

## 四、待开发功能（MVP 上线前建议完成）

### Phase 0 — 阻塞发布（必须完成）

| # | 功能 | 工作量 | 说明 |
|---|------|--------|------|
| F-01 | **任务"完成"操作** | 0.5天 | 后端 `updateTaskStatus()` 已存在。需在 TaskCard 添加"完成任务"按钮 → 调用新 API `PUT /tasks/{id}/done` → 前端刷新看板。这是任务闭环的**最后一步** |
| F-02 | **密码重置功能** | 1天 | 用户忘记密码无法恢复。需要：发邮件流程(或简化版：管理员重置) + `POST /auth/reset-password` + 前端 ForgotPassword 页面 |
| F-03 | **头像上传** | 1天 | 当前仅首字母色块。需要：文件上传 API (`POST /users/avatar`) + 前端 Settings 页面上传组件 + 图片存储(本地/OSS) |

**Phase 0 总计: 2.5 天**

### Phase 1 — 强烈建议（提升可信度）

| # | 功能 | 工作量 | 说明 |
|---|------|--------|------|
| F-04 | **Settings 偏好持久化** | 0.5天 | 扩展 users 表添加 `preferences JSONB 字段` 或新建 user_preferences 表。覆盖：角色偏好、通知开关、隐私设置 |
| F-05 | **OAuth2 第三方登录** | 2天 | GitHub OAuth2 / Google OAuth2。需要：后端 OAuth2 Client + 前端回调处理 + 绑定已有账号逻辑 |
| F-06 | **Leaderboard 多维度排序** | 0.5天 | 后端 LeaderboardService 扩展：本周活跃(7天内XP增量)、月度新星(30天)、徽章收集数排序 |
| F-07 | **想法墙真实用户关联** | 0.5天 | idea 表增加 `user_id FK`（可选），发布时记录真实用户；浏览时显示用户头像链接到 ProfilePage |

**Phase 1 总计: 3.5 天**

### Phase 2 — 锦上添花（MVP 后迭代）

| # | 功能 | 工作量 | 优先级说明 |
|---|------|--------|-----------|
| F-08 | **信用评分系统** | 3天 | 设计文档标注 ⭐⭐ 待实现。基于：任务按时完成率、评论质量、项目参与度 |
| F-09 | **邮件通知** | 2天 | 当前仅站内通知。需要：邮件服务(SMTP) + 模板引擎 + 异步队列 |
| F-10 | **AI 任务拆解** | 3天 | CreatePage AI 分析目前是前端规则匹配。可接入 LLM API 真正智能拆解需求为任务清单 |
| F-11 | **文件上传/版本管理** | 3天 | CollabSpace 文件 Tab 目前只读展示。需要：上传 API + 文件存储 + 版本对比 |
| F-12 | **移动端适配** | 3天 | 设计文档标注低优先。当前桌面端优先 |
| F-13 | **社区自治工具** | 4天 | 投票、提案系统（低优先级） |
| F-14 | **导师匹配/学习路径** | 4天 | 中优先级（设计文档 4.2 节） |
| F-15 | **成果展厅增强** | 1天 | ShowcasePage 目前较简单，可增加筛选/搜索/贡献者详情 |

**Phase 2 总计: 20+ 天（MVP 后迭代）**

---

## 五、MVP 发布检查清单

### 必须满足条件（Go / No-Go）

- [ ] **F-01**: 任务可标记完成（闭环）
- [ ] **B-01**: 评论发送后列表自动刷新
- [ ] **B-02**: 想法墙使用真实用户名
- [ ] **B-03/B-04**: 收藏/Fork 按钮对接真实 API 或隐藏
- [ ] **密码重置**: 至少有管理员手动重置方案
- [ ] **E2E 测试**: 核心流程通过 Playwright 测试
  - [ ] 注册 → 登录 → 访问 Dashboard
  - [ ] 创建项目 → 设置里程碑 → 创建任务 → 认领任务
  - [ ] 想法墙发布 → 点赞 → 转化为项目
- [ ] **数据安全**: 生产环境数据库密码非默认 / JWT Secret 非 dev 值
- [ ] **CORS 配置**: 仅允许前端域名访问
- [ ] **错误处理**: 全局异常处理器正常工作（已实现 `GlobalExceptionHandler`）

### 建议满足条件（提升品质）

- [ ] **F-03**: 头像上传（即使基础版）
- [ ] **F-04**: Settings 开关持久化
- [ ] **B-05 ~ B-11**: P1 Bug 修复
- [ ] **README 更新**: 包含部署指南、环境变量说明
- [ ] **PRODUCT.md**: 产品文档与实际功能同步

---

## 六、开发排期建议（MVP 冲刺）

```
Week 1 (Day 1-5):
├── Day 1:   F-01 任务完成操作 + B-01 评论刷新
├── Day 2:   B-02 想法墙用户名 + B-03/B-04 收藏/Fork 修复
├── Day 3:   F-02 密码重置（简化版：管理员重置链接）
├── Day 4:   F-03 头像上传 + F-04 Settings 持久化
├── Day 5:   B-05 ~ B-11 P1 Bug 修复 + E2E 测试补充
│
Week 2 (Day 6-10):
├── Day 6-7: F-06 Leaderboard 增强 + F-07 想法墙用户关联
├── Day 8:   全面回归测试（手动 + E2E）
├── Day 9:   安全审计（CORS/JWT/SQL注入/ XSS）
└── Day 10:  部署准备 + README + Product doc 更新
```

---

## 七、架构概要图

```
┌─────────────────────────────────────────────────────────┐
│                    Conlaboro MVP                        │
├─────────────────────────────────────────────────────────┤
│  前端 (React 18 + Vite + CSS Modules)                  │
│  ├── 14 页面 (Home/Login/Register/Create/Dashboard/     │
│  │          Detail/Profile/Leaderboard/Showcase/       │
│  │          Recruiting/IdeaWall/IdeaDetail/Settings)   │
│  ├── 11 组件 (Navbar/TaskBoard/CollabSpace/            │
│  │          NotificationPanel/JoinModal/...)           │
│  └── API 层 (Axios + JWT 拦截器, 11 个模块)            │
├─────────────────────────────────────────────────────────┤
│  后端 (Spring Boot 3 + MyBatis-Plus + PostgreSQL)       │
│  ├── 11 Controllers (Auth/User/Project/Application/    │
│  │                  Badge/Leaderboard/Notification/     │
│  │                  Stats/Activity/Favorite/Idea)      │
│  ├── 11 Services (含 BadgeAutoService 自动触发)         │
│  ├── 16 张表 (Flyway V1-V8 迁移)                      │
│  └── Security (JWT Filter + BCrypt 密码加密)           │
└─────────────────────────────────────────────────────────┘
```

---

*文档版本: 1.0 | 基于 2026-04-28 全代码库评估 | 预计 MVP 冲刺: 10 个工作日*
