-- =============================================
-- Conlaboro Database Schema V6
-- Add Idea Wall Tables
-- =============================================

-- 想法表
CREATE TABLE IF NOT EXISTS ideas (
    id              BIGSERIAL PRIMARY KEY,
    content         VARCHAR(500) NOT NULL,
    author_name     VARCHAR(30)  NOT NULL,
    like_count      INTEGER      DEFAULT 0,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- 想法点赞记录表
CREATE TABLE IF NOT EXISTS idea_likes (
    id              BIGSERIAL PRIMARY KEY,
    idea_id         BIGINT       NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id         BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(idea_id, user_id)
);
