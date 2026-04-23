# Conlaboro - 共创公社

> 开放、共享、协作 — 每个人都有创造力，这里有和你一样的人。

**Conlaboro** 是一个团队项目协作与成员展示平台，具有游戏化的等级/经验值（XP）/徽章体系，让开源协作更有参与感。

---

## 技术栈

| 层 | 技术 | 版本 |
|---|------|------|
| **前端** | React 18 + Vite 5 + React Router 6 | ^18.3.1 / ^5.4.11 |
| **HTTP 客户端** | Axios | ^1.15.2 |
| **后端** | Spring Boot 3.3 + Java 17 | 3.3.5 |
| **ORM / 数据访问** | MyBatis-Plus (Spring Boot 3) | 3.5.9 |
| **数据库** | PostgreSQL (TIMESTAMPTZ) | — |
| **数据库迁移** | Flyway | 10.18.2 |
| **安全认证** | Spring Security + JWT (JJWT) | 0.12.6 |
| **其他** | Lombok, Validation, Actuator | — |

## 项目结构

```
Conlaboro/
├── frontend/                        # React 前端
│   ├── src/
│   │   ├── api/                     # API 模块 (auth, user, project, badge, notification...)
│   │   ├── components/              # 通用组件 (Navbar, ProjectCard, NotificationPanel...)
│   │   ├── pages/                   # 页面组件 (Home, Dashboard, Detail, Profile...)
│   │   ├── context/                 # Context 状态管理 (AppContext, DataContext)
│   │   ├── hooks/                   # 自定义 Hooks (useToast, useScrollReveal)
│   │   ├── data/                    # 静态种子数据
│   │   ├── assets/                  # 样式文件
│   │   ├── App.jsx                  # 路由配置
│   │   └── main.jsx                 # 入口
│   ├── vite.config.js               # Vite 配置 (API 代理 → :8080)
│   └── package.json
│
├── backend/                          # Spring Boot 后端
│   └── src/main/java/com/conlaboro/
│       ├── ConlaboroApplication.java    # 启动类
│       ├── common/                      # Result 统一响应, ErrorCode 错误码
│       ├── config/                      # CORS 跨域, Security 安全配置
│       ├── controller/                  # REST 控制器 (6 个)
│       │   ├── AuthController           # /api/auth (注册/登录/当前用户)
│       │   ├── UserController           # /api/users (用户列表/资料)
│       │   ├── ProjectController        # /api/projects (项目列表/详情)
│       │   ├── BadgeController          # /api/badges (徽章)
│       │   ├── LeaderboardController    # /api/leaderboard (排行榜)
│       │   └── NotificationController   # /api/notifications (通知中心)
│       ├── dto/                         # 数据传输对象
│       ├── entity/                      # MyBatis-Plus 实体 (12 个)
│       ├── mapper/                      # MyBatis-Plus Mapper (11 个)
│       ├── service/                     # 业务服务层 (6 个)
│       ├── security/                    # JWT 认证 (TokenProvider, AuthFilter, UserPrincipal)
│       └── exception/                   # 全局异常处理
│   └── src/main/resources/
│       └── db/migration/            # Flyway 迁移脚本 (V1~V4)
│           ├── V1__Create_tables.sql      # 建表 (11 张核心表)
│           ├── V2__Seed_data.sql         # 种子数据 (16 用户 + 6 项目 + 16 徽章)
│           ├── V3__Reset_sequences.sql   # 重置自增序列
│           └── V4__Create_notifications.sql # 通知表 + 种子通知
```

## 功能模块

### 用户系统
- 注册 / 登录 (JWT Token 认证)
- 个人资料页 (技能展示 / 徽章墙 / 参与项目)
- 头像颜色自定义、个人简介

### 项目管理
- 项目浏览 (按分类: app/web/ai/game/tool，按状态: open/progress/done)
- 搜索与筛选
- 项目详情页 (角色招募 / 里程碑 / 任务看板 / 评论协作 / 文件共享)

### 游戏化激励
- **等级系统**: Newcomer(1) → Intermediate(2) → Skilled(3) → Expert(4) → Veteran(5) ... 最高 Legend(7)
- **XP 经验值**: 通过完成任务获得
- **徽章成就**: 16 种徽章分 9 大系列 (Join/Social/Streak/Achievement/Skill/Learning/Growth/Precision/Creative/Network/Ultimate)
- **排行榜**: 按 XP 全局排名

### 通知系统
- 5 种通知类型: application(申请) / member(成员) / update(更新) / recommend(推荐) / system(系统)
- 未读计数 / 单条已读 / 全部标读

## 快速开始

### 前置条件
- Java 17+
- Node.js 18+ (或通过 nvm 管理)
- PostgreSQL 14+
- Maven 3.8+

### 1. 数据库配置

创建 PostgreSQL 数据库：
```sql
CREATE DATABASE conlaboro;
```

修改后端配置 `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/conlaboro
    username: your_username
    password: your_password
```

> Flyway 会自动执行 V1~V4 迁移脚本建表并插入种子数据。

### 2. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端启动在 **http://localhost:8080**

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器在 **http://localhost:5173**，自动代理 `/api` 到后端。

### 4. 访问系统

打开浏览器访问 http://localhost:5173

**种子账号**: 邮箱格式，密码任意（开发模式使用 mock hash）

| 角色 | 邮箱 |
|------|------|
| Admin | alex@conlaboro.com |
| Lead | maya@conlaboro.com |
| Member | jordan@conlaboro.com |

## API 接口一览

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 注册 | 否 |
| POST | `/api/auth/login` | 登录 | 否 |
| GET | `/api/auth/me` | 当前用户信息 | 是 |
| GET | `/api/users` | 所有用户列表 | 是 |
| GET | `/api/users/{id}` | 用户资料 | 是 |
| GET | `/api/projects` | 项目列表 (含 roles) | 是 |
| GET | `/api/projects/{id}` | 项目详情 (含 roles/milestones/tasks/comments/files) | 是 |
| GET | `/api/badges` | 全部徽章 | 是 |
| GET | `/api/badges/mine?userId=` | 已获得徽章 | 是 |
| GET | `/api/leaderboard?sort=xp` | 排行榜 | 是 |
| GET | `/api/notifications` | 我的通知列表 | 是 |
| GET | `/api/notifications/unread-count` | 未读数量 | 是 |
| PUT | `/api/notifications/{id}/read` | 标单条已读 | 是 |
| PUT | `/api/notifications/read-all` | 全部标已读 | 是 |

所有接口返回统一格式：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

## 数据库表结构

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `users` | 用户 | id, name, email, color, role, level, xp |
| `badges` | 徽章定义 | icon, name, series, condition |
| `user_skills` | 用户技能 | user_id, name, percentage |
| `user_badges` | 用户徽章关联 | user_id, badge_id, earned_at |
| `projects` | 项目 | title, status, category, total_hours, total_commits |
| `project_roles` | 项目角色 | project_id, name, emoji, needed, filled |
| `milestones` | 里程碑 | project_id, title, status, date |
| `tasks` | 任务 | milestone_id, name, status, assignee, xp |
| `comments` | 评论 | project_id, user_name, text |
| `files` | 文件 | project_id, name, uploader |
| `notifications` | 通知 | user_id, type, title, content, is_read |

## 注意事项

- **PostgreSQL 时间类型**: 使用 `TIMESTAMP WITH TIME ZONE`(TIMESTAMPTZ)，Java 端需用 `OffsetDateTime` 映射，不能用 `LocalDateTime`
- **自增序列**: 手工插入 seed data 后需用 `setval()` 重置序列 (见 V3 migration)
- **Request Attribute**: Controller 使用 `@RequestAttribute("userId")` 获取当前用户 ID，需在 `JwtAuthFilter` 中通过 `request.setAttribute("userId", userId)` 设置
- **CORS**: 开发环境已放开跨域限制 (`CorsConfig.java`)

## License

MIT
