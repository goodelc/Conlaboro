-- =============================================
-- V4: Create notifications table + seed data
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL,       -- application / member / update / recommend / system
    type_icon       VARCHAR(10) NOT NULL DEFAULT '📢',
    title           VARCHAR(100) NOT NULL,
    content         TEXT,
    link            VARCHAR(255),               -- 可跳转链接（如 /detail/1）
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- 种子通知数据（给种子用户生成一些示例通知）
INSERT INTO notifications (user_id, type, type_icon, title, content, link, is_read) VALUES
-- 用户1 (Alex Chen) 的通知
(1, 'application', '🎉',  '申请通过',   '恭喜！你已被接受加入项目 RecipeHub 担任 AI Engineer 角色。',         '/detail/1', FALSE),
(1, 'update',      '📢',  '项目更新',    '项目 RecipeHub 完成了里程碑 M2：AI 推荐上线。',                    '/detail/1', TRUE),
(1, 'member',      '🤝',  '新成员加入',  'Taylor Kim 加入了你参与的 RecipeHub 项目，担任 Frontend Dev。',     '/detail/1', TRUE),
(1, 'recommend',   '💡',  '新项目推荐',  '有一个新项目 CodeReviewBot 正在招募 ML Engineer，与你的技能匹配。', '/detail/4', FALSE),

-- 用户2 (Maya Lin) 的通知
(2, 'application', '🎉',  '申请通过',   '恭喜！你已被接受加入项目 CollabSpace 担任 Full Stack 角色。',        '/detail/2', FALSE),
(2, 'member',      '🤝',  '新成员加入',  'Jordan Park 加入了你参与的 CollabSpace 项目。',                     '/detail/2', TRUE),
(2, 'update',      '📢',  '项目更新',    '项目 HealthPulse 完成了全部里程碑！状态已变为 done。',             '/detail/6', FALSE),

-- 用户3 (Jordan Park) 的通知
(3, 'application', '🎉',  '申请通过',   '恭喜！你已被接受加入项目 RecipeHub 担任 Backend Dev 角色。',         '/detail/1', TRUE),
(3, 'member',      '🤝',  '新成员加入',  'Alex Chen 邀请你参与新项目 CodeReviewBot。',                       '/detail/4', FALSE),
(3, 'system',      '🔔',  '系统通知',    '欢迎！你的等级已提升为 Skilled，继续保持！',                        NULL,       TRUE),

-- 用户4-5 的通知
(4, 'application', '🎉',  '申请通过',   '恭喜！你已被接受加入项目 GameForge 担任 Game Dev 角色。',           '/detail/5', TRUE),
(5, 'member',      '🤝',  '新成员加入',  'Sam Rivera 加入了你参与的 RecipeHub 项目。',                         '/detail/1', FALSE);

-- 重置序列（V3 可能还没跑到的保险）
SELECT setval('notifications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM notifications));
