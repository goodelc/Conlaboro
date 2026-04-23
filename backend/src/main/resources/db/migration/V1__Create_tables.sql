-- =============================================
-- Conlaboro Database Schema V1
-- PostgreSQL + MyBatis-Plus
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    color           VARCHAR(7)   DEFAULT '#6366f1',
    role            VARCHAR(30)  DEFAULT 'member',
    level           INT          DEFAULT 1,
    level_name      VARCHAR(20)  DEFAULT 'Newcomer',
    xp              INT          DEFAULT 0,
    project_count   INT          DEFAULT 0,
    badge_count     INT          DEFAULT 0,
    joined_at       DATE         DEFAULT CURRENT_DATE,
    bio             TEXT         DEFAULT '',
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    deleted         INT          DEFAULT 0
);

-- 徽章定义表
CREATE TABLE badges (
    id              BIGSERIAL PRIMARY KEY,
    icon            VARCHAR(10)  NOT NULL,
    name            VARCHAR(50)  NOT NULL,
    series          VARCHAR(20)  NOT NULL,
    description     TEXT         NOT NULL,
    condition       TEXT         NOT NULL
);

-- 用户技能表
CREATE TABLE user_skills (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES users(id),
    name            VARCHAR(50)  NOT NULL,
    percentage      INT          NOT NULL CHECK (percentage BETWEEN 0 AND 100),
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- 用户徽章关联表
CREATE TABLE user_badges (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES users(id),
    badge_id        BIGINT       NOT NULL REFERENCES badges(id),
    earned_at       DATE         DEFAULT CURRENT_DATE,
    UNIQUE(user_id, badge_id)
);

-- 项目表
CREATE TABLE projects (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(100) NOT NULL,
    description     TEXT,
    status          VARCHAR(15)  CHECK (status IN ('open','progress','done')) DEFAULT 'open',
    category        VARCHAR(15)  CHECK (category IN ('app','ai','web','tool','game')),
    author_id       BIGINT       REFERENCES users(id),
    author_name     VARCHAR(50),
    author_color    VARCHAR(7),
    created_at      DATE         DEFAULT CURRENT_DATE,
    duration        INT,
    license         VARCHAR(30),
    total_hours     BIGINT       DEFAULT 0,
    total_commits   INT          DEFAULT 0,
    completed_at    DATE
);

-- 项目角色表
CREATE TABLE project_roles (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name            VARCHAR(50)  NOT NULL,
    emoji           VARCHAR(5),
    needed          INT          NOT NULL,
    filled          INT          DEFAULT 0
);

-- 项目里程碑表
CREATE TABLE milestones (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(100) NOT NULL,
    status          VARCHAR(15)  DEFAULT 'open',
    date            DATE,
    sort_order      INT          DEFAULT 0
);

-- 任务表
CREATE TABLE tasks (
    id              BIGSERIAL PRIMARY KEY,
    milestone_id    BIGINT       NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    status          VARCHAR(15)  DEFAULT 'open',
    assignee        VARCHAR(50),
    xp              INT          DEFAULT 0
);

-- 评论表
CREATE TABLE comments (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_name       VARCHAR(50)  NOT NULL,
    user_color      VARCHAR(7),
    text            TEXT         NOT NULL,
    time            TIMESTAMPTZ  DEFAULT NOW()
);

-- 文件表
CREATE TABLE files (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    icon            VARCHAR(3),
    uploader        VARCHAR(50),
    time            TIMESTAMPTZ  DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_project_status ON projects(status);
CREATE INDEX idx_projects_author ON projects(author_id);
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
