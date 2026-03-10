-- ============================================================
-- Migration: Add status column to applications
-- Run this in the Supabase SQL Editor BEFORE deploying the
-- scraping pipeline code.
-- ============================================================

-- Add status column (default 'pending' for new rows)
ALTER TABLE applications
  ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Constrain to valid values
ALTER TABLE applications
  ADD CONSTRAINT chk_status CHECK (status IN ('pending', 'approved', 'rejected'));

-- Mark all existing seed rows as approved so they remain visible
UPDATE applications SET status = 'approved' WHERE status = 'pending';

-- Index for fast filtering by status
CREATE INDEX idx_applications_status ON applications (status);
