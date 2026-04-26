-- =============================================
-- V5: 申请表、活动流表、收藏表
-- =============================================

-- 项目申请表
CREATE TABLE IF NOT EXISTS applications (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_name       VARCHAR(50)  NOT NULL,
    introduction    TEXT         NOT NULL,
    status          VARCHAR(15)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    reviewed_by     BIGINT       REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(project_id, applicant_id)
);

CREATE INDEX idx_applications_project ON applications(project_id, status);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);

-- 活动流表（记录用户在项目中的操作）
CREATE TABLE IF NOT EXISTS activities (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT       REFERENCES projects(id) ON DELETE SET NULL,
    user_id         BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name       VARCHAR(50)  NOT NULL,
    user_color      VARCHAR(7),
    action_type     VARCHAR(30)  NOT NULL,   -- joined / claimed_task / completed_task / commented / uploaded / milestone_done
    target_type     VARCHAR(20),              -- task / milestone / comment / file
    target_id       BIGINT,
    text            TEXT         NOT NULL,
    xp_reward       INT          DEFAULT 0,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_project ON activities(project_id);
CREATE INDEX idx_activities_time ON activities(created_at DESC);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id      BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
