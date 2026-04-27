-- =============================================
-- Conlaboro Database Schema V7
-- Add Idea Comment Tables
-- =============================================

-- 想法评论表
CREATE TABLE IF NOT EXISTS idea_comments (
    id              BIGSERIAL PRIMARY KEY,
    idea_id         BIGINT       NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id         BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         VARCHAR(500) NOT NULL,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);
