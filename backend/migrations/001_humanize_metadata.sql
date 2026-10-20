-- Idempotent fresh installs should use schema.sql. This migration is for an existing backend schema.
ALTER TABLE humanize_requests
  ADD COLUMN grant_breakdown JSON NULL,
  ADD COLUMN prompt_version VARCHAR(20) NULL,
  ADD COLUMN validation_warning TINYINT(1) NOT NULL DEFAULT 0;
