-- MVP 上线修复: 用户偏好 + 头像字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
COMMENT ON COLUMN users.preferences IS '用户偏好设置 (角色偏好/通知开关/隐私设置)';

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512);
COMMENT ON COLUMN users.avatar_url IS '头像URL';

-- 想法表增加 user_id（可选关联）
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
