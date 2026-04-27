-- =============================================
-- Conlaboro Database Schema V8
-- Add comment_count column to ideas table
-- =============================================

ALTER TABLE ideas ADD COLUMN IF NOT EXISTS comment_count INT NOT NULL DEFAULT 0;
