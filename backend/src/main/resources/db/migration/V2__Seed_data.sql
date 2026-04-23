-- =============================================
-- Conlaboro Seed Data V2
-- 初始数据：17用户 + 6项目 + 16徽章
-- =============================================

INSERT INTO badges (id, icon, name, series, description, condition) VALUES
(1, '🎉', 'First Steps',     'Join',       '完成注册',                    '首次登录系统'),
(2, '🤝', 'Team Player',      'Social',     '参与第一个项目',               '加入任意项目'),
(3, '💬', 'Conversationalist','Social',     '发表10条评论',                 '评论数达到10'),
(4, '⭐', 'Star Gazer',       'Social',     '获得5个点赞',                 '被点赞5次'),
(5, '🔥', 'On Fire',          'Streak',     '连续活跃7天',                 '连续登录7天'),
(6, '🏆', 'Champion',         'Achievement','XP达到1000',                  '累计XP≥1000'),
(7, '🚀', 'Rocketeer',        'Achievement','完成第一个项目',               '状态变为done'),
(8, '🧠', 'Brainstormer',     'Skill',      'AI相关贡献',                  '参与AI类别项目'),
(9, '🛡️', 'Guardian',         'Skill',      'Web安全贡献',                 '发现安全问题'),
(10,'📚', 'Scholar',          'Learning',   '学习5项技能',                  '技能种类≥5'),
(11,'🌟', 'Rising Star',      'Growth',     '等级达到3级',                 'level ≥ 3'),
(12,'💪', 'Iron Will',        'Growth',     '等级达到5级',                 'level ≥ 5'),
(13,'🎯', 'Bullseye',         'Precision',  '任务完成率100%',               '所有分配任务完成'),
(14,'🌐', 'Globetrotter',     'Network',    '参与3+项目',                  '参与项目≥3'),
(15,'🎨', 'Artist',           'Creative',   '自定义头像颜色',              '修改过color'),
(16,'👑', 'Legend',           'Ultimate',   '等级达到7级（最高）',          'level = 7');

INSERT INTO users (id, name, email, password_hash, color, role, level, level_name, xp,
                   project_count, badge_count, joined_at, bio) VALUES
(1, 'Alex Chen',    'alex@conlaboro.com', '$2a$10$mock_hash_alex', '#6366f1', 'admin', 5,  'Veteran', 3200, 3, 6, '2024-03-15', '全栈开发者，热爱开源协作'),
(2, 'Maya Lin',     'maya@conlaboro.com',  '$2a$10$mock_hash_maya', '#ec4899', 'lead',  4,  'Expert', 2100, 2, 4, '2024-04-20', 'UI/UX设计师，专注用户体验'),
(3, 'Jordan Park',  'jordan@conlaboro.com','$2a$10$mock_hash_jord','#22c55e', 'member',3,  'Skilled',1200, 2, 3, '2024-05-10', '后端工程师，擅长微服务'),
(4, 'Sam Rivera',   'sam@conlaboro.com',   '$2a$10$mock_hash_sam',  '#f97316', 'member',3,  'Skilled',1050, 1, 3, '2024-06-01', 'DevOps工程师，自动化爱好者'),
(5, 'Taylor Kim',   'taylor@conlaboro.com','$2a$10$mock_hash_tayl','#8b5cf6', 'member',2,  'Intermediate',550, 1, 2, '2024-07-15', '前端开发，React生态'),
(6, 'Casey Morgan', 'casey@conlaboro.com', '$2a$10$mock_hash_case','#06b6d4', 'member',2,  'Intermediate',480, 1, 2, '2024-08-20', '数据分析师，Python/R'),
(7, 'Riley Zhang',  'riley@conlaboro.com', '$2a$10$mock_hash_rile','#14b8a6', 'member',2,  'Intermediate',420, 0, 2, '2024-09-01', '产品经理，敏捷实践者'),
(8, 'Avery Wu',     'avery@conlaboro.com', '$2a$10$mock_hash_aver','#ef4444', 'member',1,  'Newcomer',150, 0, 1, '2024-10-12', '新人开发者，学习中'),
(9, 'Quinn Davis',  'quinn@conlaboro.com', '$2a$10$mock_hash_quin','#eab308', 'member',1,  'Newcomer',90,  0, 1, '2024-11-05', '测试工程师，QA驱动'),
(10,'Drew Foster',  'drew@conlaboro.com',  '$2a$10$mock_hash_drew','#ec4899', 'member',1,  'Newcomer',60,  0, 1, '2025-01-18', '移动端开发，Flutter'),
(11,'Morgan Lee',   'morgan@conlaboro.com','$2a$10$mock_hash_morg','#6366f1', 'member',1,  'Newcomer',30,  0, 1, '2025-02-20', '技术写作者，文档专家'),
(12,'Jamie Fox',    'jamie@conlaboro.com', '$2a$10$mock_hash_jami','#22c55e', 'member',1,  'Newcomer',20,  0, 1, '2025-03-08', '运维工程师，K8s玩家'),
(13,'Blake Chen',   'blake@conlaboro.com', '$2a$10$mock_hash_blak','#8b5cf6', 'member',1,  'Newcomer',10,  0, 0, '2025-04-01', '实习生，充满热情'),
(14,'Sage Johnson', 'sage@conlaboro.com',  '$2a$10$mock_hash_sage','#f97316', 'member',1,  'Newcomer',0,   0, 0, '2025-04-15', '新成员，欢迎！'),
(15,'Reese Wang',   'reese@conlaboro.com', '$2a$10$mock_hash_rees','#06b6d4', 'member',1,  'Newcomer',0,   0, 0, '2025-04-20', '新成员，欢迎！'),
(16,'Finley Park',  'finley@conlaboro.com','$2a$10$mock_hash_finl','#14b8a6', 'member',1,  'Newcomer',0,   0, 0, '2025-04-22', '新成员，欢迎！');

-- 用户技能
INSERT INTO user_skills (user_id, name, percentage) VALUES
(1, 'React', 92), (1, 'Java', 85), (1, 'PostgreSQL', 78),
(2, 'Figma', 95), (2, 'CSS', 88), (2, 'UI/UX', 82),
(3, 'Spring Boot', 88), (3, 'Docker', 75), (3, 'K8s', 60),
(4, 'CI/CD', 90), (4, 'AWS', 80), (4, 'Terraform', 65),
(5, 'JavaScript', 87), (5, 'Vue', 72), (5, 'TypeScript', 68),
(6, 'Python', 91), (6, 'Pandas', 84), (6, 'SQL', 79),
(7, 'Scrum Master', 85), (7, 'Jira', 78), (7, 'Agile', 82);

-- 用户已获得徽章
INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES
(1, 1, '2024-03-15'), (1, 2, '2024-04-01'), (1, 6, '2024-07-01'),
(1, 11, '2024-09-01'), (1, 14, '2024-10-01'), (1, 16, '2025-01-01'),
(2, 1, '2024-04-20'), (2, 2, '2024-05-15'), (2, 10, '2024-09-01'), (2, 15, '2024-10-01'),
(3, 1, '2024-05-10'), (3, 2, '2024-06-01'), (3, 8, '2024-08-01');

-- 项目
INSERT INTO projects (id, title, description, status, category,
                     author_id, author_name, author_color, created_at, duration,
                     license, total_hours, total_commits) VALUES
(1, 'RecipeHub', 'AI驱动的智能食谱推荐平台，支持 dietary restriction 过滤',
     'done', 'ai', 1, 'Alex Chen', '#6366f1', '2024-04-01', 45, 'MIT', 320, 156),
(2, 'CollabSpace', '实时协作文档编辑器，支持多人同时编辑与版本控制',
     'progress', 'web', 2, 'Maya Lin', '#ec4899', '2024-05-15', 60, 'Apache-2.0', 180, 89),
(3, 'EcoTracker', '个人碳足迹追踪应用，可视化环境影响数据',
     'open', 'app', 3, 'Jordan Park', '#22c55e', '2024-07-01', 30, 'GPL-3.0', 0, 0),
(4, 'CodeReviewBot', '自动代码审查机器人，基于 LLM 提供改进建议',
     'progress', 'tool', 1, 'Alex Chen', '#6366f1', '2024-08-10', 35, 'MIT', 95, 42),
(5, 'GameForge', '像素风格 RPG 游戏引擎，内置关卡编辑器',
     'open', 'game', 4, 'Sam Rivera', '#f97316', '2024-09-20', 90, 'Proprietary', 0, 0),
(6, 'HealthPulse', '健康监测仪表板，整合多设备 wearable 数据',
     'done', 'app', 2, 'Maya Lin', '#ec4899', '2024-03-10', 50, 'MIT', 280, 134);

-- 项目角色
INSERT INTO project_roles (project_id, name, emoji, needed, filled) VALUES
(1, 'Frontend Dev', '🎨', 3, 3), (1, 'Backend Dev', '⚙️', 2, 2), (1, 'AI Engineer', '🧠', 2, 2), (1, 'Designer', '🖼️', 1, 1),
(2, 'Full Stack', '🔧', 4, 3), (2, 'UX Designer', '✏️', 2, 2), (2, 'WebSocket Expert', '🔌', 1, 1),
(3, 'Mobile Dev', '📱', 2, 1), (3, 'Data Analyst', '📊', 2, 1), (3, 'UI Designer', '🎨', 1, 0),
(4, 'ML Engineer', '🤖', 2, 2), (4, 'Backend Dev', '⚙️', 2, 1), (4, 'DevOps', '🛠️', 1, 1),
(5, 'Game Dev', '🎮', 3, 2), (5, 'Pixel Artist', '🖌️', 2, 1), (5, 'Sound Designer', '🔊', 1, 0),
(6, 'iOS Dev', '🍎', 2, 2), (6, 'Android Dev', '🤖', 2, 2), (6, 'Health API Integ', '💓', 1, 1);

-- 项目里程碑
INSERT INTO milestones (project_id, title, status, date, sort_order) VALUES
(1, 'MVP 发布', 'done', '2024-05-01', 0),
(1, 'AI 推荐上线', 'done', '2024-06-15', 1),
(1, '社交功能', 'done', '2024-07-30', 2),

(2, '核心编辑器', 'done', '2024-06-30', 0),
(2, '实时同步', 'progress', NULL, 1),
(2, '权限管理', 'open', NULL, 2),

(3, '需求分析', 'open', NULL, 0),
(3, '原型设计', 'open', NULL, 1),
(3, 'MVP 开发', 'open', NULL, 2),

(4, 'LLM 集成', 'done', '2024-09-15', 0),
(4, '规则引擎', 'progress', NULL, 1),
(4, 'GitHub App', 'open', NULL, 2),

(5, '引擎内核', 'open', NULL, 0),
(5, '地图编辑器', 'open', NULL, 1),
(5, '战斗系统', 'open', NULL, 2),

(6, '设备对接', 'done', '2024-04-15', 0),
(6, 'Dashboard', 'done', '2024-05-20', 1),
(6, '报告生成', 'done', '2024-06-25', 2);

-- 任务
INSERT INTO tasks (milestone_id, name, status, assignee, xp) VALUES
-- RecipeHub tasks
(1, '搭建 React 框架', 'done', 'Alex Chen', 50),
(1, '实现搜索功能', 'done', 'Taylor Kim', 40),
(2, '接入 OpenAI API', 'done', 'Alex Chen', 80),
(2, '推荐算法优化', 'done', 'Jordan Park', 60),
(3, '分享功能开发', 'done', 'Maya Lin', 30),

-- CollabSpace tasks
(4, 'CRDT 算法实现', 'done', 'Maya Lin', 100),
(4, '光标同步协议', 'done', 'Jordan Park', 70),
(5, '冲突解决策略', 'progress', 'Alex Chen', 90),
(6, 'RBAC 设计', 'open', NULL, 40);
