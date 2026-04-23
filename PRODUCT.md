# Conlaboro 共创公社 — 产品开发文档

> **版本**: 1.0 | **最后更新**: 2026-04-24  
> **定位**: 开放、共享、协作的团队项目协作平台，具有游戏化激励体系  
> **Slogan**: *每个人都有创造力 — 开放、共享、协作*

---

## 目录

1. [产品愿景与设计哲学](#1-产品愿景与设计哲学)
2. [设计系统（Design System）](#2-设计系统design-system)
3. [页面规格说明](#3-页面规格说明)
4. [组件库规范](#4-组件库规范)
5. [数据模型与 API 契约](#5-数据模型与-api-契约)
6. [状态管理与上下文架构](#6-状态管理与上下文架构)
7. [前端开发规范](#7-前端开发规范)
8. [后端开发规范](#8-后端开发规范)
9. [路由地图](#9-路由地图)
10. [功能迭代路线图](#10-功能迭代路线图)

---

## 1. 产品愿景与设计哲学

### 1.1 核心价值主张

| 价值 | 说明 |
|------|------|
| **开放** | 零门槛参与，不需要简历、不看重头衔 |
| **共享** | 项目成果默认开源，知识不属于任何人 |
| **协作** | 志同道合的人自发组织，透明推进 |

### 1.2 公社六大原则（UI 展示在 HomePage）

1. **贡献即权力** — 不靠头衔说话，靠代码/文档/设计说话
2. **成果共享** — 默认开源协议，知识不被垄断
3. **透明协作** — 所有讨论、决策、进度公开可见
4. **自愿加入** — 随时选择项目与角色，随时可退出
5. **失败自由** — 失败了也有经验和伙伴留下
6. **多元包容** — 零经验也可参与，背景不限

### 1.3 用户旅程（How It Works）

```
发布想法 → 组建团队 → 协作共建 → 共享成果
   💡         🤝        🔨          🚀
```

### 1.4 游戏化体系

#### 等级系统

| 等级 | 名称 | XP 阈值 | 颜色 |
|------|------|---------|------|
| 1 | 新社员 | 0 | `--warm-gray` (#8B8578) |
| 2 | 创客 | 100 | #4A90D9 |
| 3 | 建设者 | 500 | `--success` (#228B22) |
| 4 | 骨干 | 1,500 | #8B5CF6 |
| 5 | 引领者 | 4,000 | `--gold` (#D4A843) |
| 6 | 先驱 | 10,000 | `--red` (#D4213D) |
| 7 | 传奇 | 99,999+ | `--red` |

#### 徽章系统（16 枚，9 大系列）

| 系列 | 徽章 | 获得条件 |
|------|------|----------|
| 入门(4) | 初心者/第一把火/第一笔/握手/初出茅庐 | 完成资料/首次加入/首次贡献/首次被接受/首个里程碑 |
| 实践(4) | 产品之手/设计之眼/代码之力/质量之盾 | 作为 PM/设计/开发/测试 各完成 3 个项目 |
| 协作(4) | 领航者/桥梁/导师/不灭 | 发起上线1个项目/参与5类项目/帮10人Review/连续30天贡献 |
| 传奇(3) | 公社之星/全栈创客/造物主 | XP Top 1% / 集齐 PM+设计+开发 / 发起并上线 3 个项目 |

---

## 2. 设计系统（Design System）

### 2.1 色彩体系（CSS Variables）

```css
:root {
  /* 主色 */
  --red:        #D4213D;    /* 品牌主色 - 用于 CTA、强调、链接 hover */
  --red-dark:   #A11A30;    /* 主色深态 - hover、active */
  --gold:       #D4A843;    /* 金色 - 等级、成就、精选标记 */
  --gold-light: #F0D68A;    /* 浅金 - 进度条渐变 */

  /* 背景 */
  --cream:      #F5F0E8;    /* 奶油底色 - 卡片交替背景 */
  --paper:      #FAF7F0;    /* 纸白底色 - 页面主背景 */

  /* 文字 */
  --ink:        #1A1A1A;    /* 主文字 */
  --ink-light:  #3D3D3D;    /* 次文字 */
  --warm-gray:  #8B8578;    /* 辅助文字、占位符 */

  /* 边框 & 功能 */
  --border:     #D4CFC5;    /* 边框线 */
  --success:    #228B22;    /* 成功/已完成状态 */
}
```

### 2.2 字体系统

| 用途 | 字体家族 | 字重 |
|------|----------|------|
| **标题/品牌** | `'Noto Serif SC', serif` | 900 (Black), 700 (Bold) |
| **正文/UI** | `'Noto Sans SC', sans-serif` | 300(Light), 400(Rg), 500(Med), 700(Bd) |
| **数字/徽章** | `'Noto Serif SC', serif` | 900 |

> Google Fonts 引入: `@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');`

### 2.3 间距与布局

| Token | 值 | 使用场景 |
|-------|-----|----------|
| 页面 padding | `8rem 2rem` | 标准页面区块 |
| 区块间距 | `3rem` | Section 之间 |
| 内容最大宽 | `1200px` | HomePage 主内容区 |
| Detail 最大宽 | `1000px` | 详情页主体 |
| Dashboard 最大宽 | `1100px` | 仪表盘内容 |
| 设置页最大宽 | `700px` | 设置表单区 |
| Grid gap | `1.5rem ~ 2rem` | 卡片网格间距 |

### 2.4 圆角与阴影

| 元素 | 圆角 | 阴影 |
|------|------|------|
| 按钮 | 无圆角 (`btn-primary`) | hover: `0 8px 24px rgba(212,33,61,0.25)` |
| 卡片 | 无圆角 | hover: `0 12px 40px rgba(0,0,0,0.08)` |
| 头像 | `50%` (圆形) | border: 2px solid |
| 输入框 | 无圆角 | focus: `0 0 0 3px rgba(212,33,61,0.1)` |
| Modal | 无圆角 | `box-shadow` 内嵌 |
| Badge 图标 | `50%` (圆形) | earned: `0 2px 8px rgba(212,168,67,0.2)` |

### 2.5 按钮规范

| 类型 | Class | 样式 | 使用场景 |
|------|-------|------|----------|
| **Primary** | `.btn-primary` | `bg: var(--red), color: white` | 主要操作（登录/发布/加入） |
| **Secondary** | `.btn-secondary` | `transparent + border: 2px solid var(--border)` | 次要操作（取消/收藏） |
| **White CTA** | `.btn-white` | `white bg, color: var(--red)` | 深色背景上的 CTA（如 .cta 区域） |
| **Nav CTA** | `.nav-cta` | 同 btn-primary 但更紧凑 | 导航栏注册按钮 |

**按钮交互规范**:
- Primary hover: `translateY(-2px)` + 加深背景 + 扩散阴影
- 所有按钮 transition: `all 0.3s ease`
- Primary 按钮 hover 有光泽扫过动画 (`::before` linear-gradient)

### 2.6 状态标签（Status Tags）

| 状态 | 中文 | CSS Class | 颜色 |
|------|------|-----------|------|
| `open` | 招募中 | `.tag-open` | `bg: rgba(212,33,61,0.1), text: var(--red)` |
| `progress` | 进行中 | `.tag-progress` | `bg: rgba(212,168,67,0.15), text: #8B6914` |
| `done` | 已完成 | `.tag-done` | `bg: rgba(34,139,34,0.1), text: var(--success)` |

> 定义于 `constants.js`: `STATUS_MAP`, `TAG_CLASS`, `STATUS_COLORS`

### 2.7 动画系统

| 动画名 | 触发方式 | 效果 | 使用场景 |
|--------|----------|------|----------|
| `fadeInUp` | 页面加载/滚动进入 | 从下往上淡入 | Hero 文字、步骤卡片 |
| `fadeInDown` | 页面加载 | 从上往下淡入 | Hero badge |
| `heroGlow` | 持续循环 | 背景光晕缓慢旋转移动 | Hero 区背景装饰 |
| `pageIn` | 页面切换 | 下滑 + 淡入 | 旧 page system (已弃用) |
| `reveal` | IntersectionObserver | 滚动到视口时触发 fadeInUp | HomePage 各 section |
| `modalIn` | Modal 打开 | 缩放从 95% + 上移 | 弹窗 |
| `toastIn / toastOut` | Toast 出现/消失 | 右滑入 / 下滑出 | 全局提示 |
| `badgeUnlock` | 徽章解锁 | 旋转缩放弹入 | 成就解锁 |
| `pulse` | 持续循环 | 呼吸缩放 | Hero badge 绿点 |

**全局纹理**: body `::after` 伪元素覆盖一层 SVG 噪声纹理（opacity: 0.04），营造纸张质感。

### 2.8 响应式断点

| 断点 | 触发变化 |
|------|----------|
| **≤1024px** | How grid 2列 / Projects grid 2列 / Roles 3列 / Principles 2列 / Detail body 单列 / Dashboard grid 单列 |
| **≤768px** | Nav links 隐藏 / How grid 1列 / Projects grid 1列 / Hero stats 收窄 / Auth card 收窄 / Form row 单列 / Notif panel 全屏 / Team list 单列 |

---

## 3. 页面规格说明

### 3.1 HomePage `/` (首页落地页)

**用途**: 品牌展示 + 项目浏览入口

**结构模块**:

| 序号 | 模块 | Class | 说明 |
|------|------|-------|------|
| 1 | **Hero** | `.hero` | 全屏英雄区：品牌语 `每个人都有创造力`、CTA 双按钮（浏览项目/发起想法）、统计数据（创客数/项目数/已完成数）、呼吸光晕动画 |
| 2 | **宣言区** | `.manifesto` | 品牌引用文字「各尽所能，按需协作」+ 三段信念文案 |
| 3 | **四步骤** | `.how` | 深色背景 (`var(--ink)`)，4 列网格：发布想法→组建团队→协作共建→共享成果。每个步骤含编号(01-04)、图标、标题、描述。hover 时边框变红 + 上浮 |
| 4 | **项目浏览** | `.projects` | 搜索栏 + 分类 chip(app/web/ai/game/tool) + 状态 chip(全部/招募中/进行中/已完成) + ProjectCard 网格(3列) + 无结果提示 |
| 5 | **角色区域** | `.roles-section` | 5 种角色卡片(🎯产品/🎨设计/💻开发/🧪测试/📣运营)，奶油色背景，显示在线人数估算 |
| 6 | **公社原则** | `.principles` | 6 大原则卡片(3×2 网格)，大号数字水印(01-06) |
| 7 | **CTA** | `.cta` | 红色全幅行动召唤区，大号水印文字「共创 共享 共建」，主按钮跳转 `/create` |
| 8 | **Footer** | `footer` | GitHub/Twitter/Discord 链接 |

**数据流**: `useData()` → `projects` → 前端筛选(搜索/分类/状态) → ProjectCard

**特殊逻辑**: 
- 统计数据目前从前端数据估算（TODO: 对接 `/api/stats`）
- 搜索匹配: 标题 + 描述 + 角色名称
- 使用 `useScrollReveal()` hook 实现 `.reveal` 元素的滚动渐显

---

### 3.2 LoginPage `/login`

**用途**: 用户身份验证

**结构**:
- 居中 auth-card (max-width: 440px)
- Logo + 标语
- OAuth 按钮（GitHub/Google — TODO 未实现，点击 toast 提示）
- 分隔线 `或`
- 邮箱 + 密码表单
- 底部注册链接

**验证规则**: 邮箱和密码非空检查
**成功后**: `navigate('/dashboard')`

---

### 3.3 RegisterPage `/register`

**用途**: 新用户创建账号

**表单字段**:

| 字段 | 类型 | 必填 | 验证 |
|------|------|------|------|
| 昵称 | text | 是 | 非空 |
| 邮箱 | email | 是 | 非空 |
| 密码 | password | 是 | ≥ 6 位 |
| 角色标签 | multi-select | 否 | 5 选多: 🎯PM / 🎨设计 / 💻开发 / 🧪测试 / 📣运营 |

**差异**: 卡片更宽 (max-width: 480px)，比 LoginPage 多了角色选择
**成功后**: `navigate('/dashboard')`

---

### 3.4 DashboardPage `/dashboard` ⚠️需认证

**用途**: 个人控制台，用户的「公社」

**结构模块**:

| 序号 | 模块 | Class | 说明 |
|------|------|-------|------|
| 1 | **Header** | `.dash-header` | `{用户名} 的公社` + 设置按钮 + 发起新项目按钮 |
| 2 | **荣誉栏** | `.honor-bar` | 等级图标(Lv.N) + 等级名称 + 贡献值XP + 参与项目数 + 贡献次数 + 徽章计数 + XP进度条(红→金渐变) |
| 3 | **成就徽章墙** | `.badge-wall` | 全部 16 枚徽章网格，已获得=金色边框+彩色，未获得=灰度+锁头图标。点击打开 BadgeModal |
| 4 | **我的项目** | `.dash-section` + `.dash-list` | 用户参与的项目列表，每项含 emoji icon + 标题 + 角色·状态 + 状态标签 |
| 5 | **贡献记录** | `.timeline` | 时间线样式（TODO: 对接活动流 API，当前显示空状态提示） |
| 6 | **能力图谱** | `.skills-grid` | 3 列技能卡片网格，每张: emoji + 名称 + 等级(高/中/初) + 红色进度条 |

**数据来源**: 
- `useApp()` → `currentUser` (基础信息)
- `users[currentUser.name]` 补全完整字段（bio/skills/earnedBadges 等）
- `useData()` → `badges` (全部徽章定义)

**等级升级阈值**: `[0, 100, 500, 1500, 4000, 10000, 99999]`
**等级名称映射**: `{1:'新社员', 2:'创客', 3:'建设者', 4:'骨干', 5:'引领者', 6:'先驱', 7:'传奇'}`

**技能 emoji 映射表** (DashboardPage 内硬编码 `SKILL_EMOJIS`): 
50+ 技能名 → emoji 映射（React→⚛️, Vue→💚, Python→🐍, Figma→🎨 等）

---

### 3.5 CreatePage `/create` ⚠️需认证

**用途**: 发起一个新项目

**三步表单**:

| 步骤 | 内容 | 字段 |
|------|------|------|
| **① 基本信息** | 项目名称* / 一句话描述* / 详细描述*(textarea) / 类别(select: app/web/game/tool/ai/other) / 周期(select: 2周/1月/2月/3月+) | 6 字段 |
| **② 团队角色配置** | 5 种预置角色的 ± 按钮 (0~5 人) | PM/设计/前端/后端/测试 |
| **③ 里程碑规划** | 3 个里程碑输入框 (带占位示例) | 3 字段 |

**提交逻辑**: 前端校验必填项 → toast 成功 → 1.5s 后跳转 `/dashboard`

---

### 3.6 DetailPage `/detail/:id`

**用途**: 项目详情页（最复杂的页面）

**子组件**:
- **TaskBoard**: 三列看板（待认领/进行中/已完成），TaskCard 显示任务名 + 负责人 + XP奖励 + 认领按钮
- **CollabSpace**: Tab 切换 — 讨论(评论列表+输入框) / 文件(文件列表) / 项目日志(activity feed)

**详情 Hero 区域**:
- 面包屑导航: `首页 > 探索项目 > {标题}`
- 项目标题 (含状态 tag) + 操作按钮 (收藏/加入/Fork)
- 元信息行: 发起人(可点击跳转 Profile) / 创建时间 / 上线时间 / 总用时/协议 / 团队人数

**主内容区 (detail-main)**:
| 区块 | 条件 | 内容 |
|------|------|------|
| 项目描述 | 始终 | 详细描述文本 |
| 贡献者排行 | status === 'done' | 4 格摘要统计(总用时/总提交/人数/完成度) + 排行列表(金银铜牌+头像+姓名+角色+XP+工时+提交数+贡献占比进度条) |
| 交付物 | status === 'done' | 2 列交付物卡片(图标+名称+描述+箭头) |
| 任务看板 | 始终 | TaskBoard 子组件 |
| 协作空间 | 始终 | CollabSpace 子组件 |
| 里程碑 | 始终 | 竖向时间线(done绿/current金/pending灰) + 任务 tags |
| 项目动态 | activities 存在时 | activity-feed (头像+用户名+操作文本+时间) |
| 团队成员 | 始终 | 2 列成员卡(头像+姓名+角色+状态) + 空缺位(虚线边框+?号+申请按钮) |

**侧边栏 (detail-sidebar)**:
| 区块 | 条件 | 内容 |
|------|------|------|
| 项目成就 | done | 金边框卡片，列出前 2 名贡献者的解锁徽章 + 全员纪念徽章 |
| 角色招募 | 始终 | 每个角色一行: 已满(cream背景) 或 可申请(红色边框+申请按钮) |
| 项目信息 | 始终 | 类别/周期/协议/创建时间 (info-row key-value 对) |
| 贡献记录 | 始终 | 总提交/总工时/完成度 |

**数据加载**: `useEffect` → `getProjectDetail(id)` API → `setDetail(data)`
**字段映射兼容** (处理前后端字段不一致):
```js
p.description || p.desc           // 描述
p.authorName || p.author          // 发起人
c.authorName || c.author          // 评论作者
f.uploaderName || f.uploader       // 文件上传者
c.content || c.text               // 评论内容
```

---

### 3.7 ProfilePage `/profile/:name`

**用途**: 用户个人主页（公开）

**结构**:
- **Hero 区**: 大头像(88px) + 姓名(h1) + 元信息(角色·等级·加入时间) + 简介 + 3 项统计(XP/项目数/徽章数)
- **Body** (grid: 1fr + 340px):
  - 左侧: **参与项目列表** (dash-list 格式)
  - 右侧栏: **徽章墙**(小尺寸48px版) + **技能条**(横向进度条) + **等级进度**

**未找到用户**: 显示「用户不存在」+ 返回首页按钮

---

### 3.8 LeaderboardPage `/leaderboard`

**用途**: 全局排行榜

**Tab 切换**: 贡献值总榜 / 本周活跃 / 月度新星 / 徽章收集（当前仅总榜有真实数据排序）

**布局**:
- **领奖台** (lb-podium): 前 3 名 3 列网格，第 1 名居中放大(金色边框+80px头像+box-shadow)
- **列表** (lb-list): 第 4 名起，每行: 排名 + 头像 + 姓名 + 角色·等级 + 数值

**排序**: 按 XP 降序: `Object.values(userData).sort((a,b) => b.xp - a.xp)`

---

### 3.9 ShowcasePage `/showcase`

**用途**: 已完成项目成果展厅

**结构**:
- **精选项目** (showcase-featured): 第一个 done 项目的大卡片，金色边框+渐变背景，含完整 meta 信息
- **项目网格** (showcase-grid): 其余 done 项目 2 列卡片，每张: 已完成 badge + 标题 + 截断描述 + 发起人/用时/提交数
- **空状态**: 无已完成项目时的提示

**注意**: 当前 ShowcasePage 直接用 `projects.filter(p => p.status === 'done')` 过滤，但项目数据格式为 `{project, roles}` wrapper，需要适配 `(item.project || item).status`

---

### 3.10 SettingsPage `/settings` ⚠️需认证

**用途**: 个人设置中心

**分区**:

| 分区 | 内容 |
|------|------|
| **个人资料** | 昵称(编辑弹窗)/个人简介(编辑弹窗，≤200字)/技能标签(选择弹窗，20个可选技能选≤6个) |
| **角色偏好** | 想担任的角色(5选多 Tag) + 偏好项目类别(5选多 Tag) |
| **通知设置** | 5 个 Toggle: 申请状态更新/项目动态/新成员加入/项目推荐/成就解锁 |
| **隐私设置** | 3 个 Toggle: 公开主页/显示在线状态/显示贡献值 |

**内部组件**:
- `ToggleSwitch`: 自定义开关 (44px×24px, active = var(--red))
- `RoleTag`: 选择标签 (active = var(--red) 实心)
- `EditModal`: 复用 modal 样式的内嵌编辑弹窗

**保存机制**: `saveUser(partial)` → `login(updated)` 更新 AppContext + localStorage + toast 提示

---

### 3.11 NotFound `*`

**用途**: 404 兜底页

- 大号 `404` + 「页面走丢了」提示 + 返回首页 + 刷新重试

---

## 4. 组件库规范

### 4.1 通用组件清单

| 组件 | 文件 | Props | 用途 |
|------|------|-------|------|
| **Navbar** | `Navbar.jsx` | (无) | 顶部导航栏：Logo + 导航链接 + 通知铃铛 + 头像 + 登录/登出 + CTA |
| **ProjectCard** | `ProjectCard.jsx` | `{ p }` — 项目数据(wrapper格式) | 项目卡片：状态tag + 标题 + 描述(截断3行) + 角色badges + 成员头像堆叠 + 查看按钮。使用 `memo()` 优化 |
| **JoinModal** | `JoinModal.jsx` | (全局 state) | 申请加入项目弹窗：选择角色 + 自我介绍(textarea) + ESC 关闭 |
| **BadgeModal** | `BadgeModal.jsx` | (全局 state) | 徽章详情弹窗：大图标 + 系列 + 名称 + 描述 + 获得条件 + 解锁状态/日期 |
| **NotificationPanel** | `NotificationPanel.jsx` | (全局 state) | 右侧抽屉通知面板(400px宽)：未读计数 + 通知列表 + 相对时间格式化 + 点击标读 |
| **ToastContainer** | `ToastContainer.jsx` | (全局 state) | 全局 Toast 队列：右下角堆叠，3 秒自动消失，支持 success/info 类型 |
| **ErrorBoundary** | `ErrorBoundary.jsx` | `{ children }` | React 错误边界：catch 渲染错误，显示友好错误页 + 刷新按钮 |
| **RequireAuth** | `RequireAuth.jsx` | `{ children }` | 路由守卫：未登录 → 重定向 `/login` |
| **ScrollToTop** | `ScrollToTop.jsx` | (无) | 路由切换时自动滚回顶部 |

### 4.2 数据包装格式（重要！）

后端 `getAllProjects()` 返回的每个元素是 **wrapper 对象**：

```json
{
  "project": { "id": 1, "title": "...", "status": "open", ... },
  "roles": [
    { "id": 1, "name": "前端开发", "emoji": "💻", "needed": 2, "filled": 1 }
  ]
}
```

**所有消费组件必须使用安全访问模式**:
```jsx
const project = p.project || p      // 兼容裸项目和 wrapper
const roles = p.roles || []         // 兜底空数组
const members = roles.flatMap(r => r.members || [])  // 兜底 undefined members
```

### 4.3 Modal 规范

所有 Modal 统一结构:
- 外层 `.modal-overlay.active` (fixed 全屏半透明黑背景 + flex 居中)
- 内层 `.modal` (白色卡片 max-width: 500px, padding: 2.5rem)
- 标题: `font-family: 'Noto Serif SC', serif; font-weight: 900; font-size: 1.3rem`
- 支持点击遮罩层关闭 + ESC 键关闭

---

## 5. 数据模型与 API 契约

### 5.1 数据库核心实体

| 表名 | Entity | 核心字段 |
|------|--------|----------|
| `users` | User | id, name, email, passwordHash, color, role, level, levelName, xp, projectCount, badgeCount, joinedAt, bio, deleted |
| `projects` | Project | id, title, description, **status** (open/progress/done), **category** (app/web/ai/game/tool), authorId, authorName, authorColor, createdAt, duration, license, totalHours, totalCommits, completedAt |
| `project_roles` | ProjectRole | id, projectId, name, emoji, needed, filled |
| `milestones` | Milestone | id, projectId, title, status (done/current/pending), date, sortOrder |
| `tasks` | Task | id, milestoneId, name, status (open/progress/done), assignee, xp |
| `comments` | Comment | id, projectId, userName, userColor, text, time (OffsetDateTime) |
| `files` | FileEntity | id, projectId, name, icon, uploader, time (OffsetDateTime) |
| `badges` | Badge | id, icon (emoji), name, series, description, condition |
| `user_badges` | UserBadge | id, userId, badgeId, earnedAt (LocalDate) |
| `user_skills` | UserSkill | id, userId, name, percentage (0-100) |
| `notifications` | Notification | id, userId, type, typeIcon, title, content, link, isRead, createdAt (OffsetDateTime) |

### 5.2 API 接口一览

| 方法 | 路径 | 认证 | 返回 data 结构 | 说明 |
|------|------|------|----------------|------|
| POST | `/api/auth/register` | 否 | User 对象 | 注册 |
| POST | `/api/auth/login` | 否 | {userId, name, email, token, ...} | 登录 |
| GET | `/api/auth/me` | **是** | User 对象 | 当前用户 |
| GET | `/api/users` | **是** | `User[]` (name-keyed map in frontend) | 所有用户 |
| GET | `/api/users/{id}` | **是** | User 对象 | 用户资料 |
| GET | `/api/projects` | **是** | `List<Map>` 每个 `{project, roles}` | 项目列表(**重要: wrapper 格式**) |
| GET | `/api/projects/{id}` | **是** | `{project, roles, milestones, tasks, comments, files}` | 项目详情 |
| GET | `/api/badges` | **是** | `Badge[]` | 全部徽章 |
| GET | `/api/badges/mine` | **是** | `Badge[]` (已获得的) | 我的徽章 |
| GET | `/api/leaderboard` | **是** | 排行数据 | 排行榜 |
| GET | `/api/notifications` | **是** | `Notification[]` | 通知列表 |
| GET | `/api/notifications/unread-count` | **是** | number | 未读数量 |
| PUT | `/api/notifications/{id}/read` | **是** | null | 标单条已读 |
| PUT | `/api/notifications/read-all` | **是** | null | 全部标已读 |

**统一响应格式**:
```json
{ "code": 200, "message": "success", "data": { ... } }
```

**前端 Axios 拦截器** (`request.js`):
- 请求: 自动附加 `Authorization: Bearer {token}`
- 响应: 自动 `return res.data`（解包 data 字段）；code !== 200 时抛错；401 时清除登录态并跳转 `/login`

---

## 6. 状态管理与上下文架构

### 6.1 Provider 层级

```
<App>
└── <DataProvider>          // DataContext — 全局数据
│   ├── users (name-keyed object + raw array as userList)
│   ├── projects (List<Map>)
│   ├── badges (Array)
│   ├── leaderboard (Array)
│   └── refetch()
│   └── <AppProvider>       // AppContext — UI 状态 + 认证
│       ├── isLoggedIn / currentUser (from localStorage 'conlaboro_auth')
│       ├── toasts [] / showToast() / removeToast()
│       ├── notifOpen / toggleNotif() / notifCount
│       ├── joinModalOpen / openJoinModal(projectId, role?) / closeJoinModal()
│       ├── badgeModalOpen / openBadgeModal(badge) / closeBadgeModal()
│       ├── login(email, pw) / register(name, email, pw) / logout()
│       └── fetchUnreadCount()
│       └── <ErrorBoundary>
│           └── <ScrollToTop />
│               <Navbar />
│               <Routes... />
│               <ToastContainer />
│               <NotificationPanel />
│               <JoinModal />        // 全局 single instance
│               <BadgeModal />        // global single instance
```

### 6.2 AppContext Reducer Actions

| Action Type | Payload | Effect |
|-------------|--------|--------|
| `ADD_TOAST` | `{ msg, toastType? }` | 推入 toasts 队尾 |
| `REMOVE_TOAST` | `id` | 从队列移除 |
| `TOGGLE_NOTIF` | — | 切换通知面板 + 清零计数 |
| `OPEN_JOIN_MODAL` | `{ projectId, role? }` | 打开申请弹窗 |
| `CLOSE_JOIN_MODAL` | — | 关闭申请弹窗 |
| `OPEN_BADGE_MODAL` | `badge` | 打开徽章详情 |
| `CLOSE_BADGE_MODAL` | — | 关闭徽章详情 |
| `SET_NOTIF_COUNT` | `count` | 设置未读数 |
| `LOGIN` | `{ user: apiRes }` | 写入 localStorage + 更新 state |
| `LOGOUT` | — | 清除 localStorage + 更新 state |
| `SET_LOADING` | `boolean` | 全局 loading |

### 6.3 本地存储 Key

| Key | 值结构 | 说明 |
|-----|--------|------|
| `conlaboro_auth` | `{ isLoggedIn: bool, currentUser: { id, name, email, token, color, role, level, levelName, xp, projects, badges } }` | 登录态持久化 |

---

## 7. 前端开发规范

### 7.1 技术栈约束

- React 18/19 + Function Components + Hooks (禁止 Class Components，除 ErrorBoundary)
- Vite 5 构建，React Router v6/v7
- 状态管理: useReducer + Context (不用 Redux/Zustand)
- HTTP: Axios (实例 baseURL: '/api')
- CSS: 单一全局 styles.css + CSS Variables (不用 CSS Modules / Tailwind)

### 7.2 文件命名约定

| 类型 | 命名 | 示例 |
|------|------|------|
| 页面 | PascalCase + `Page.jsx` | `HomePage.jsx`, `DetailPage.jsx` |
| 组件 | PascalCase + `.jsx` | `ProjectCard.jsx`, `Navbar.jsx` |
| Hook | camelCase + `use*.js` | `useScrollReveal.js`, `useToast.js` |
| Context | PascalCase + `Context.jsx` | `AppContext.jsx`, `DataContext.jsx` |
| API | camelCase + `.js` | `auth.js`, `project.js` |
| 数据 | camelCase + `.js` | `users.js`, `badges.js` |
| 常量 | camelCase + `.js` | `constants.js` |
| 样式 | kebab-case + `.css` | `styles.css` |
| 测试 | 同文件名 + `.test.{js,jsx}` | `ProjectCard.test.jsx` |

### 7.3 编码约定

1. **null 安全访问**: 后端数据可能缺少字段，始终使用 `||` 兜底
   ```jsx
   const project = p.project || p
   const roles = p.roles || []
   const skills = u.skills || []
   ```
2. **颜色解析**: 用户 color 为 hex 字符串（如 `#D4213D`），需转为 rgb 使用：
   ```jsx
   const rgb = parseInt(color.slice(1), 16)
   const r = (rgb >> 16) & 255, g = (rgb >> 8) & 255, b = rgb & 255
   ```
3. **导航统一**: 优先用 `useNavigate()` hook；外部链接用 `<Link>`
4. **Toast 调用**: `showToast('消息', 'success'/'error'/'info')` from `useApp()`
5. **常量提取**: 状态映射、颜色等共享值放在 `constants.js`

### 7.4 目录结构

```
frontend/src/
├── api/              # API 模块（按领域分文件）
│   ├── index.js      # 统一导出
│   ├── request.js    # Axios 实例 + 拦截器
│   ├── auth.js
│   ├── user.js
│   ├── project.js
│   ├── badge.js
│   ├── leaderboard.js
│   └── notification.js
├── components/       # 通用组件
├── pages/            # 页面组件
├── context/          # Context Provider
│   ├── AppContext.jsx     # UI 状态 + 认证
│   └── DataContext.jsx    # 全局数据
├── hooks/            # 自定义 Hooks
├── data/             # 静态种子数据（逐步被 API 替代）
├── assets/
│   └── styles.css    # 全局样式（唯一 CSS 文件）
├── constants.js      # 全局常量
├── App.jsx           # 路由配置
└── main.jsx          # 入口
```

---

## 8. 后端开发规范

### 8.1 技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| 框架 | Spring Boot | 3.3.6 |
| 语言 | Java | 17+ (21) |
| ORM | MyBatis-Plus | 3.5.9 |
| DB | PostgreSQL (TIMESTAMPTZ) | 14+ |
| 迁移 | Flyway | 10.18.2 |
| 认证 | Spring Security + JWT (JJWT) | 0.12.6 |
| 其他 | Lombok, Validation, Actuator, H2(test) | — |

### 8.2 分层架构

```
controller/  →  service/  →  mapper(MyBatis-Plus)
                    ↓
              entity/ (Lombok @Data @TableName)
              dto/     (请求/响应对象)
              common/  (Result<T>, ErrorCode)
              config/  (CORS, Security, JwtFilter)
              security/(TokenProvider, AuthFilter, UserPrincipal)
              exception/(GlobalExceptionHandler)
```

### 8.2 关键约定

| 约定 | 说明 |
|------|------|
| 时间类型 | PostgreSQL 用 `TIMESTAMPTZ` → Java 用 `OffsetDateTime`（**不能用 LocalDateTime!**） |
| 用户标识 | Controller 用 `@RequestAttribute("userId")` 获取当前用户 ID（JwtAuthFilter 中 setAttribute） |
| 统一响应 | `Result<T>{ code, message, data }` 封装 |
| 逻辑删除 | `@TableLogic private Integer deleted` |
| 自增序列 | 手工插入 seed 后需 `setval()` 重置（见 V3 migration） |
| CORS | 开发环境已放开 (`CorsConfig.java`) |

---

## 9. 路由地图

| 路径 | 组件 | 认证保护 | 用途 |
|------|------|----------|------|
| `/` `/home` | HomePage | — | 首页(落地页+项目浏览) |
| `/login` | LoginPage | — | 登录 |
| `/register` | RegisterPage | — | 注册 |
| `/detail/:id` | DetailPage | — | 项目详情 |
| `/profile/:name` | ProfilePage | — | 个人主页 |
| `/leaderboard` | LeaderboardPage | — | 排行榜 |
| `/showcase` | ShowcasePage | — | 成果展厅 |
| `/create` | CreatePage | ✅ RequireAuth | 发起项目 |
| `/dashboard` | DashboardPage | ✅ RequireAuth | 仪表盘 |
| `/settings` | SettingsPage | ✅ RequireAuth | 设置 |
| `*` | NotFound | — | 404 |

---

## 10. 功能迭代路线图

### Phase 1 — 核心 ✅ (已完成)

- [x] 用户注册/登录 (JWT)
- [x] 项目浏览/搜索/筛选
- [x] 项目详情页（看板/评论/里程碑/团队）
- [x] 个人仪表盘（等级/XP/徽章/技能）
- [x] 排行榜 / 成果展厅
- [x] 通知系统
- [x] 前端 Vitest 测试 (18 tests passing)
- [x] 后端 JUnit5 测试框架
- [x] Playwright E2E 测试脚本

### Phase 2 — 进行中 / 待完善

- [ ] **CreatePage 真实提交**: 当前仅 toast 提示，需对接 `POST /api/projects` 创建项目 + 角色批量写入
- [ ] **JoinModal 真实申请**: 需对接 `POST /api/projects/{id}/apply` 申请接口
- [ ] **任务认领**: TaskBoard 的「认领此任务」按钮需对接 `PUT /api/tasks/{id}/claim`
- [ ] **评论发送**: CollabSpace 评论输入需对接 `POST /api/projects/{id}/comments`
- [ ] **OAuth 登录**: GitHub / Google OAuth2 接入（LoginPage 已预留 UI）
- [ ] **SettingsPage 持久化**: 昵称/简介/技能修改需对接 `PUT /api/users/profile`
- [ ] **贡献记录 Timeline**: Dashboard 的贡献记录需对接活动流 API
- [ ] **首页统计对接**: Hero 统计数据需对接 `GET /api/stats`
- [ ] **ShowcasePage 数据适配**: 需改用 `(item.project || item).status` 过滤
- [ ] **Leaderboard 多 Tab**: 目前只有 XP 排序，需实现本周/月度/徽章 Tab

### Phase 3 — 未来规划

- [ ] WebSocket 实时协作（看板拖拽同步、实时评论）
- [ ] 文件上传/下载（OSS 对接）
- [ ] Markdown 编辑器（项目描述/评论增强）
- [ ] 项目 Fork 与分支管理
- [ ] 私信/站内消息系统
- [ ] i18n 国际化
- [ ] PWA 离线支持
- [ ] 移动端适配优化（当前仅有基础响应式）

---

## 附录 A: 种子账号

| 邮箱 | 角色 | 用途 |
|------|------|------|
| `alex@conlaboro.com` | Admin | 超级管理员 |
| `maya@conlaboro.com` | Lead | 项目负责人 |
| `jordan@conlaboro.com` | Member | 普通成员 |

> 开发模式密码任意（mock hash 校验）

---

## 附录 B: 快速启动命令

```bash
# 后端
cd backend && mvn spring-boot:run          # http://localhost:8080

# 前端
cd frontend && npm install && npm run dev  # http://localhost:5173

# 前端测试
npm run test                               # Vitest

# 后端测试
cd backend && mvn test                     # JUnit5

# E2E 测试
npx playwright install chromium
npm run test:e2e                           # Playwright
```

---

> **文档维护**: 此产品文档随代码演进持续更新。每次新增页面或修改设计规范时，请同步更新本文档对应章节。
