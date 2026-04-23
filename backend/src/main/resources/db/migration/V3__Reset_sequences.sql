-- =============================================
-- V3: Reset auto-increment sequences after seed data
-- 解决种子数据插入后序列不同步导致 DuplicateKeyException 的问题
-- =============================================

SELECT setval('badges_id_seq',   (SELECT COALESCE(MAX(id), 1) FROM badges));
SELECT setval('users_id_seq',    (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('projects_id_seq', (SELECT COALESCE(MAX(id), 1) FROM projects));
SELECT setval('project_roles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM project_roles));
SELECT setval('milestones_id_seq',    (SELECT COALESCE(MAX(id), 1) FROM milestones));
SELECT setval('tasks_id_seq',         (SELECT COALESCE(MAX(id), 1) FROM tasks));
SELECT setval('comments_id_seq',      (SELECT COALESCE(MAX(id), 1) FROM comments));
SELECT setval('files_id_seq',         (SELECT COALESCE(MAX(id), 1) FROM files));
