-- Select/create the target database before importing this schema.

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  google_sub VARCHAR(255) NULL UNIQUE,
  email_verified_at DATETIME NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  stripe_customer_id VARCHAR(255) NULL UNIQUE,
  visitor_id CHAR(36) NULL,
  signup_ref_code VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  INDEX idx_users_visitor (visitor_id), INDEX idx_users_ref (signup_ref_code)
) ENGINE=InnoDB;

CREATE TABLE sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_expiry (expires_at), INDEX idx_sessions_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE email_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  kind ENUM('verify','reset') NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_tokens_expiry (expires_at), INDEX idx_email_tokens_user_kind (user_id,kind),
  CONSTRAINT fk_email_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE word_grants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  source ENUM('free','subscription','one_time','adjustment') NOT NULL,
  plan VARCHAR(32) NULL,
  words_granted INT UNSIGNED NOT NULL,
  words_used INT UNSIGNED NOT NULL DEFAULT 0,
  provider_ref VARCHAR(255) NULL UNIQUE,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_grants_balance (user_id,expires_at),
  CONSTRAINT fk_grants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE humanize_requests (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  mode ENUM('natural','academic','simple') NOT NULL,
  status ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
  input_text LONGTEXT NULL,
  output_text LONGTEXT NULL,
  input_word_count INT UNSIGNED NOT NULL,
  output_word_count INT UNSIGNED NULL,
  grant_breakdown JSON NULL,
  prompt_version VARCHAR(20) NULL,
  validation_warning TINYINT(1) NOT NULL DEFAULT 0,
  tokens_in INT UNSIGNED NULL,
  tokens_out INT UNSIGNED NULL,
  cost_micro_usd BIGINT UNSIGNED NOT NULL DEFAULT 0,
  model VARCHAR(120) NULL,
  error_code VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  INDEX idx_humanize_user_created (user_id,created_at), INDEX idx_humanize_pending (user_id,status,created_at),
  INDEX idx_humanize_budget (created_at,status), INDEX idx_humanize_expiry (expires_at),
  CONSTRAINT fk_humanize_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  provider_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  plan VARCHAR(32) NOT NULL,
  status VARCHAR(40) NOT NULL,
  current_period_start DATETIME NULL,
  current_period_end DATETIME NULL,
  cancel_at_period_end TINYINT(1) NOT NULL DEFAULT 0,
  monthly_amount_cents INT UNSIGNED NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subscriptions_user (user_id), INDEX idx_subscriptions_mrr (status,cancel_at_period_end),
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  provider_ref VARCHAR(255) NOT NULL UNIQUE,
  subscription_id VARCHAR(255) NULL,
  plan VARCHAR(32) NOT NULL,
  kind ENUM('subscription','one_time') NOT NULL,
  status ENUM('succeeded','failed','refunded') NOT NULL,
  amount_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  ref_code VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_user (user_id), INDEX idx_payments_date_status (created_at,status), INDEX idx_payments_ref (ref_code),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE stripe_events (
  event_id VARCHAR(255) NOT NULL PRIMARY KEY,
  event_type VARCHAR(120) NOT NULL,
  status ENUM('processing','processed','failed') NOT NULL DEFAULT 'processing',
  error_code VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE visitors (
  vid CHAR(36) NOT NULL PRIMARY KEY,
  ref_code VARCHAR(80) NULL,
  utm_source VARCHAR(160) NULL,
  utm_medium VARCHAR(160) NULL,
  utm_campaign VARCHAR(160) NULL,
  utm_content VARCHAR(160) NULL,
  ip_hash CHAR(64) NULL,
  first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visitors_ref (ref_code), INDEX idx_visitors_first_seen (first_seen_at)
) ENGINE=InnoDB;

CREATE TABLE analytics_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  vid CHAR(36) NULL,
  event VARCHAR(80) NOT NULL,
  props JSON NULL,
  ref_code VARCHAR(80) NULL,
  ip_hash CHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_analytics_event_date (event,created_at), INDEX idx_analytics_vid (vid), INDEX idx_analytics_user (user_id,created_at), INDEX idx_analytics_ref (ref_code),
  CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE campaign_links (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ref_code VARCHAR(80) NOT NULL UNIQUE,
  creator_id BIGINT UNSIGNED NULL,
  hook_id BIGINT UNSIGNED NULL,
  campaign VARCHAR(160) NULL,
  views BIGINT UNSIGNED NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_campaign_creator (creator_id), INDEX idx_campaign_hook (hook_id)
) ENGINE=InnoDB;

CREATE TABLE creators (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  handle VARCHAR(160) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE hooks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE rate_limits (
  rate_key VARCHAR(190) NOT NULL PRIMARY KEY,
  hits INT UNSIGNED NOT NULL DEFAULT 0,
  window_started_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  INDEX idx_rate_expiry (expires_at)
) ENGINE=InnoDB;

CREATE TABLE cron_runs (
  task VARCHAR(80) NOT NULL,
  run_date DATE NOT NULL,
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(task,run_date)
) ENGINE=InnoDB;

CREATE TABLE issue_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id CHAR(36) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  message VARCHAR(1000) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_issue_created (created_at),
  CONSTRAINT fk_issue_request FOREIGN KEY (request_id) REFERENCES humanize_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_issue_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE OR REPLACE VIEW v_campaign_stats AS
SELECT c.id AS campaign_link_id, c.ref_code, c.creator_id, c.hook_id, c.campaign, c.views,
  COALESCE(v.visitors,0) AS visitors,
  COALESCE(u.signups,0) AS signups,
  COALESCE(p.paid_users,0) AS paid_users,
  COALESCE(p.revenue_cents,0) AS revenue_cents
FROM campaign_links c
LEFT JOIN (SELECT ref_code,COUNT(DISTINCT vid) visitors FROM visitors GROUP BY ref_code) v ON v.ref_code=c.ref_code
LEFT JOIN (SELECT signup_ref_code ref_code,COUNT(*) signups FROM users WHERE deleted_at IS NULL GROUP BY signup_ref_code) u ON u.ref_code=c.ref_code
LEFT JOIN (SELECT ref_code,COUNT(DISTINCT user_id) paid_users,COALESCE(SUM(amount_cents),0) revenue_cents FROM payments WHERE status='succeeded' GROUP BY ref_code) p ON p.ref_code=c.ref_code;

ALTER TABLE campaign_links
  ADD CONSTRAINT fk_campaign_creator FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_campaign_hook FOREIGN KEY (hook_id) REFERENCES hooks(id) ON DELETE SET NULL;
