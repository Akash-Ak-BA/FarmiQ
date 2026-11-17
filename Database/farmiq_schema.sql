-- =====================================================================
-- FarmiQ database schema  (MySQL 8 / TiDB Cloud compatible)
-- How to run: MySQL Workbench > File > Open SQL Script > pick this file
-- > click the lightning-bolt button. Then right-click the schemas panel
-- > Refresh All. Expected result: 20 tables + 1 view.
-- If your host does not let you create a database, delete the first two
-- statements and run the rest inside the database you already have.
-- Row-level privacy is NOT enforced by MySQL: the app code must filter
-- every query by the logged-in user's id.
-- =====================================================================
CREATE DATABASE IF NOT EXISTS farmiq CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmiq;

-- ---------- Accounts ----------
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  district VARCHAR(100) NULL,
  language ENUM('en','ta','te') NOT NULL DEFAULT 'en',
  theme ENUM('system','light','dark') NOT NULL DEFAULT 'system',
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  UNIQUE KEY uq_users_phone (phone)
);

-- Long-lived login sessions ("stay signed in")
CREATE TABLE sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  UNIQUE KEY uq_sessions_token (token_hash),
  KEY ix_sessions_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- Farms, plots, crops ----------
CREATE TABLE farms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255) NULL,
  latitude DECIMAL(9,6) NULL,
  longitude DECIMAL(9,6) NULL,
  area_acres DECIMAL(8,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_farms_user (user_id),
  CONSTRAINT fk_farms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE plots (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  farm_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  area_acres DECIMAL(8,2) NULL,
  soil_type VARCHAR(50) NULL,
  irrigation VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_plots_farm (farm_id),
  CONSTRAINT fk_plots_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- Reference data used to predict harvest dates and auto-create task schedules
CREATE TABLE crop_master (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_ta VARCHAR(100) NULL,
  name_te VARCHAR(100) NULL,
  duration_days INT UNSIGNED NOT NULL,
  stages JSON NULL,
  task_template JSON NULL,
  UNIQUE KEY uq_crop_master_name (name_en)
);

CREATE TABLE crops (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plot_id BIGINT UNSIGNED NOT NULL,
  crop_master_id INT UNSIGNED NULL,
  crop_name VARCHAR(100) NOT NULL,
  variety VARCHAR(100) NULL,
  sowing_date DATE NOT NULL,
  expected_harvest_date DATE NULL,
  actual_harvest_date DATE NULL,
  current_stage VARCHAR(50) NULL,
  stage_index TINYINT UNSIGNED NOT NULL DEFAULT 1,
  stage_total TINYINT UNSIGNED NOT NULL DEFAULT 5,
  status ENUM('active','harvested','failed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_crops_plot (plot_id),
  CONSTRAINT fk_crops_plot FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE,
  CONSTRAINT fk_crops_master FOREIGN KEY (crop_master_id) REFERENCES crop_master(id) ON DELETE SET NULL
);

-- Crop monitoring check-ins
CREATE TABLE crop_checkins (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  crop_id BIGINT UNSIGNED NOT NULL,
  checked_on DATE NOT NULL,
  growth_stage VARCHAR(50) NULL,
  health ENUM('good','average','poor') NOT NULL DEFAULT 'good',
  notes TEXT NULL,
  photo_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_checkins_crop (crop_id, checked_on),
  CONSTRAINT fk_checkins_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE
);

-- Crop damage photo analysis
CREATE TABLE damage_reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  crop_id BIGINT UNSIGNED NULL,
  photo_url VARCHAR(500) NOT NULL,
  detected_issue VARCHAR(200) NULL,
  confidence ENUM('low','medium','high') NULL,
  description TEXT NULL,
  natural_treatment TEXT NULL,
  chemical_advice TEXT NULL,
  safety_note TEXT NULL,
  language ENUM('en','ta','te') NOT NULL DEFAULT 'en',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_damage_user (user_id, created_at),
  CONSTRAINT fk_damage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_damage_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
);

-- ---------- Inventory ----------
CREATE TABLE inventory_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  category ENUM('seed','fertilizer','pesticide','tool','produce','other') NOT NULL DEFAULT 'other',
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  cost_per_unit DECIMAL(10,2) NULL,
  low_stock_level DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_inventory_user (user_id),
  CONSTRAINT fk_inventory_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Daily activity log
CREATE TABLE activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  crop_id BIGINT UNSIGNED NULL,
  plot_id BIGINT UNSIGNED NULL,
  activity_date DATE NOT NULL,
  type ENUM('sowing','watering','fertilizer','pesticide','weeding','labour','harvest','other') NOT NULL,
  notes TEXT NULL,
  cost DECIMAL(10,2) NULL,
  inventory_item_id BIGINT UNSIGNED NULL,
  quantity_used DECIMAL(10,2) NULL,
  photo_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_activities_user (user_id, activity_date),
  KEY ix_activities_crop (crop_id),
  CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_activities_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
  CONSTRAINT fk_activities_plot FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE SET NULL,
  CONSTRAINT fk_activities_item FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL
);

CREATE TABLE inventory_movements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_id BIGINT UNSIGNED NOT NULL,
  change_qty DECIMAL(10,2) NOT NULL,
  reason ENUM('purchase','used','harvest','sold','adjustment') NOT NULL,
  activity_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_movements_item (item_id, created_at),
  CONSTRAINT fk_movements_item FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_movements_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL
);

-- ---------- Money ----------
CREATE TABLE transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  crop_id BIGINT UNSIGNED NULL,
  type ENUM('income','expense') NOT NULL,
  category VARCHAR(50) NULL,
  amount DECIMAL(12,2) NOT NULL,
  txn_date DATE NOT NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_txn_user (user_id, txn_date),
  KEY ix_txn_crop (crop_id),
  CONSTRAINT fk_txn_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_txn_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL
);

-- ---------- Tasks, chatbot, notifications ----------
CREATE TABLE tasks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  crop_id BIGINT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  due_date DATE NOT NULL,
  remind_at DATETIME NULL,
  status ENUM('pending','done') NOT NULL DEFAULT 'pending',
  completed_at DATETIME NULL,
  confirmed_by BIGINT UNSIGNED NULL,
  source ENUM('manual','chatbot','template','damage_report') NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_tasks_user (user_id, status, due_date),
  KEY ix_tasks_crop (crop_id),
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_confirmed FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE chat_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  content TEXT NOT NULL,
  language ENUM('en','ta','te') NOT NULL DEFAULT 'en',
  proposed_task_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_chat_user (user_id, created_at),
  CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_task FOREIGN KEY (proposed_task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- Bell icon: missed notifications
CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('task','weather','stock','price','listing','system') NOT NULL,
  title VARCHAR(200) NOT NULL,
  body VARCHAR(255) NULL,
  link VARCHAR(255) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_notif_user (user_id, is_read, created_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE push_subscriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth_key VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_push_endpoint (endpoint),
  KEY ix_push_user (user_id),
  CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- Weather and market prices ----------
CREATE TABLE weather_alerts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  farm_id BIGINT UNSIGNED NOT NULL,
  alert_type ENUM('rain','heat','wind','other') NOT NULL,
  alert_date DATE NOT NULL,
  message VARCHAR(255) NOT NULL,
  sent TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_weather_farm (farm_id, alert_date),
  CONSTRAINT fk_weather_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

CREATE TABLE market_prices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  crop_name VARCHAR(100) NOT NULL,
  market_name VARCHAR(150) NOT NULL,
  district VARCHAR(100) NULL,
  price_per_quintal DECIMAL(10,2) NOT NULL,
  price_date DATE NOT NULL,
  source VARCHAR(100) NULL,
  UNIQUE KEY uq_price_day (crop_name, market_name, price_date),
  KEY ix_price_lookup (crop_name, district, price_date)
);

-- ---------- Marketplace ----------
CREATE TABLE listings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seller_id BIGINT UNSIGNED NOT NULL,
  crop_name VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  price_per_unit DECIMAL(10,2) NOT NULL,
  location VARCHAR(150) NULL,
  photo_url VARCHAR(500) NULL,
  show_phone TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('active','sold','expired','removed') NOT NULL DEFAULT 'active',
  expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_listings_browse (status, crop_name, created_at),
  KEY ix_listings_seller (seller_id),
  CONSTRAINT fk_listings_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE listing_reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id BIGINT UNSIGNED NOT NULL,
  reporter_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(255) NULL,
  status ENUM('open','reviewed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_reports_listing (listing_id),
  CONSTRAINT fk_reports_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Buyers see this view: the phone number appears only if the seller allowed it
CREATE VIEW public_listings AS
SELECT l.id, l.crop_name, l.quantity, l.unit, l.price_per_unit, l.location, l.photo_url,
       l.created_at, u.name AS seller_name,
       CASE WHEN l.show_phone = 1 THEN u.phone ELSE NULL END AS contact_phone
FROM listings l JOIN users u ON u.id = l.seller_id
WHERE l.status = 'active' AND (l.expires_at IS NULL OR l.expires_at > NOW());

-- ---------- Starter crop data (review durations with a local agriculture officer) ----------
INSERT INTO crop_master (name_en, name_ta, name_te, duration_days, stages) VALUES
('Paddy','நெல்','వరి',120,JSON_ARRAY('Sowing','Germination','Vegetative','Flowering','Harvest')),
('Tomato','தக்காளி','టమోటా',100,JSON_ARRAY('Sowing','Germination','Vegetative','Fruiting','Harvest')),
('Groundnut','நிலக்கடலை','వేరుశనగ',110,JSON_ARRAY('Sowing','Germination','Vegetative','Pod formation','Harvest')),
('Onion','வெங்காயம்','ఉల్లిపాయ',120,JSON_ARRAY('Sowing','Germination','Vegetative','Bulb formation','Harvest')),
('Banana','வாழை','అరటి',300,JSON_ARRAY('Planting','Establishment','Vegetative','Flowering','Harvest'));
