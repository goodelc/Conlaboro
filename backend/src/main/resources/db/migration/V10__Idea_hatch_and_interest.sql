-- 想法孵化优化: 参与意愿表 + ideas表扩展字段
-- 1. 新建参与意愿表
CREATE TABLE IF NOT EXISTS idea_interests (
    id          BIGSERIAL PRIMARY KEY,
    idea_id     BIGINT       NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(idea_id, user_id)
);
COMMENT ON TABLE idea_interests IS '想法参与意愿记录表';
COMMENT ON COLUMN idea_interests.idea_id IS '关联的想法ID';
COMMENT ON COLUMN idea_interests.user_id IS '表达参与意愿的用户ID';

-- 2. ideas表新增字段: 关联孵化出的项目 + 意愿计数
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS project_id     BIGINT UNIQUE REFERENCES projects(id) ON DELETE SET NULL;
COMMENT ON COLUMN ideas.project_id IS '孵化出的项目ID（NULL表示尚未孵化）';

ALTER TABLE ideas ADD COLUMN IF NOT EXISTS interest_count INTEGER      DEFAULT 0;
COMMENT ON COLUMN ideas.interest_count IS '想参与人数（冗余缓存，由idea_interests触发器维护）';
