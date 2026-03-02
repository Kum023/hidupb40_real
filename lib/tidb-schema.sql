-- B40 Life Simulator - TiDB Analytics Schema
-- Run this script to create the analytics tables in your TiDB Cloud instance
-- IMPORTANT: Run the entire script, or run tables first, then views

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `test`;
USE `test`;

-- ============================================
-- TABLES (Run these first)
-- ============================================

-- Completed Games Table
-- Stores final state of all completed games for analytics
CREATE TABLE IF NOT EXISTS `completed_games` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `convex_game_id` VARCHAR(255) NOT NULL UNIQUE,
    `player_name` VARCHAR(255) NOT NULL,
    `persona_id` VARCHAR(50) NOT NULL,
    `final_money` INT NOT NULL DEFAULT 0,
    `final_credit_score` INT NOT NULL DEFAULT 300,
    `final_health` INT NOT NULL DEFAULT 0,
    `final_stress` INT NOT NULL DEFAULT 0,
    `final_debt` INT NOT NULL DEFAULT 0,
    `weeks_completed` INT NOT NULL DEFAULT 1,
    `ending_type` VARCHAR(50) NOT NULL,
    `failure_reason` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_persona` (`persona_id`),
    INDEX `idx_ending` (`ending_type`),
    INDEX `idx_score` (`final_money` DESC),
    INDEX `idx_created` (`created_at` DESC)
);

-- Player Decisions Table
-- Stores all player decisions for behavior analysis
-- Note: No FK constraint to allow syncing during gameplay
CREATE TABLE IF NOT EXISTS `player_decisions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `convex_game_id` VARCHAR(255) NOT NULL,
    `location` VARCHAR(50) NOT NULL,
    `scenario_id` VARCHAR(100) NOT NULL,
    `choice_index` INT NOT NULL,
    `choice_text` VARCHAR(500) NOT NULL,
    `money_change` INT NOT NULL DEFAULT 0,
    `credit_change` INT NOT NULL DEFAULT 0,
    `health_change` INT NOT NULL DEFAULT 0,
    `stress_change` INT NOT NULL DEFAULT 0,
    `day` INT NOT NULL,
    `week` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_game` (`convex_game_id`),
    INDEX `idx_location` (`location`),
    INDEX `idx_week_day` (`week`, `day`)
);

-- Weekly Snapshots Table
-- Stores game state snapshot at the end of each week for progress tracking
CREATE TABLE IF NOT EXISTS `weekly_snapshots` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `convex_game_id` VARCHAR(255) NOT NULL,
    `player_name` VARCHAR(255) NOT NULL,
    `persona_id` VARCHAR(50) NOT NULL,
    `week` INT NOT NULL,
    `money` INT NOT NULL DEFAULT 0,
    `debt` INT NOT NULL DEFAULT 0,
    `credit_score` INT NOT NULL DEFAULT 300,
    `health` INT NOT NULL DEFAULT 100,
    `stress` INT NOT NULL DEFAULT 0,
    `objectives_completed` BOOLEAN NOT NULL DEFAULT FALSE,
    `work_days_completed` INT NOT NULL DEFAULT 0,
    `bought_groceries` BOOLEAN NOT NULL DEFAULT FALSE,
    `filled_petrol` BOOLEAN NOT NULL DEFAULT FALSE,
    `paid_debt` BOOLEAN NOT NULL DEFAULT FALSE,
    `weekend_activity` VARCHAR(100),
    `is_game_over` BOOLEAN NOT NULL DEFAULT FALSE,
    `ending_type` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_game_week` (`convex_game_id`, `week`),
    INDEX `idx_persona` (`persona_id`),
    INDEX `idx_week` (`week`)
);

-- Materialized View: Persona Statistics (updated periodically)
-- TiDB doesn't support materialized views, so we use a regular table updated by a scheduled job
CREATE TABLE IF NOT EXISTS `persona_stats_cache` (
    `persona_id` VARCHAR(50) PRIMARY KEY,
    `total_games` INT NOT NULL DEFAULT 0,
    `avg_final_money` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `avg_credit_score` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `avg_weeks_completed` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `success_rate` DECIMAL(5,2) NOT NULL DEFAULT 0,
    `most_common_ending` VARCHAR(50),
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- VIEWS (Run these after tables are created)
-- ============================================

-- Global Statistics View
CREATE OR REPLACE VIEW `global_stats` AS
SELECT 
    COUNT(*) as `total_games`,
    AVG(`final_money`) as `avg_final_money`,
    AVG(`final_credit_score`) as `avg_credit_score`,
    AVG(`weeks_completed`) as `avg_weeks_completed`,
    (SUM(CASE WHEN `ending_type` = 'survived' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) as `success_rate`,
    MIN(`final_money`) as `min_money`,
    MAX(`final_money`) as `max_money`
FROM `completed_games`;

-- Failure Patterns View
CREATE OR REPLACE VIEW `failure_patterns` AS
SELECT 
    `failure_reason`,
    `persona_id`,
    COUNT(*) as `failure_count`,
    AVG(`weeks_completed`) as `avg_week_failed`,
    AVG(`final_money`) as `avg_money_at_failure`,
    AVG(`final_debt`) as `avg_debt_at_failure`
FROM `completed_games`
WHERE `failure_reason` IS NOT NULL
GROUP BY `failure_reason`, `persona_id`
ORDER BY `failure_count` DESC;

-- Location Decision Analytics View
CREATE OR REPLACE VIEW `location_analytics` AS
SELECT 
    `location`,
    COUNT(*) as `total_decisions`,
    AVG(`money_change`) as `avg_money_change`,
    AVG(`credit_change`) as `avg_credit_change`,
    AVG(`health_change`) as `avg_health_change`,
    AVG(`stress_change`) as `avg_stress_change`,
    SUM(CASE WHEN `money_change` < 0 THEN 1 ELSE 0 END) as `spending_decisions`,
    SUM(CASE WHEN `money_change` > 0 THEN 1 ELSE 0 END) as `earning_decisions`
FROM `player_decisions`
GROUP BY `location`;

-- Weekly Progression Analytics View
CREATE OR REPLACE VIEW `weekly_progression` AS
SELECT 
    `week`,
    COUNT(DISTINCT `convex_game_id`) as `games_active`,
    AVG(`money_change`) as `avg_money_change`,
    AVG(`credit_change`) as `avg_credit_change`,
    AVG(`health_change`) as `avg_health_change`,
    AVG(`stress_change`) as `avg_stress_change`
FROM `player_decisions`
GROUP BY `week`
ORDER BY `week`;

-- Top Scores Leaderboard View
CREATE OR REPLACE VIEW `leaderboard_top50` AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY `final_money` DESC) as `rank`,
    `player_name`,
    `persona_id`,
    `final_money`,
    `final_credit_score`,
    `weeks_completed`,
    `ending_type`,
    `created_at`
FROM `completed_games`
ORDER BY `final_money` DESC
LIMIT 50;

-- Persona Leaderboard View (Top 10 per persona)
CREATE OR REPLACE VIEW `persona_leaderboard` AS
SELECT * FROM (
    SELECT
        ROW_NUMBER() OVER (PARTITION BY `persona_id` ORDER BY `final_money` DESC) as `persona_rank`,
        `player_name`,
        `persona_id`,
        `final_money`,
        `final_credit_score`,
        `weeks_completed`,
        `ending_type`,
        `created_at`
    FROM `completed_games`
) `ranked`
WHERE `persona_rank` <= 10;

-- Weekly Progress Analytics View
CREATE OR REPLACE VIEW `weekly_progress_analytics` AS
SELECT
    `week`,
    `persona_id`,
    COUNT(*) as `games_at_week`,
    AVG(`money`) as `avg_money`,
    AVG(`debt`) as `avg_debt`,
    AVG(`credit_score`) as `avg_credit_score`,
    AVG(`health`) as `avg_health`,
    AVG(`stress`) as `avg_stress`,
    SUM(CASE WHEN `objectives_completed` = TRUE THEN 1 ELSE 0 END) as `objectives_completed_count`,
    SUM(CASE WHEN `is_game_over` = TRUE THEN 1 ELSE 0 END) as `games_ended`
FROM `weekly_snapshots`
GROUP BY `week`, `persona_id`
ORDER BY `week`, `persona_id`;

-- Active Games Progress View (games that have snapshots but no completed_games entry)
CREATE OR REPLACE VIEW `active_games` AS
SELECT
    ws.`convex_game_id`,
    ws.`player_name`,
    ws.`persona_id`,
    MAX(ws.`week`) as `current_week`,
    (SELECT `money` FROM `weekly_snapshots` ws2 WHERE ws2.`convex_game_id` = ws.`convex_game_id` ORDER BY `week` DESC LIMIT 1) as `latest_money`,
    (SELECT `health` FROM `weekly_snapshots` ws2 WHERE ws2.`convex_game_id` = ws.`convex_game_id` ORDER BY `week` DESC LIMIT 1) as `latest_health`,
    (SELECT `stress` FROM `weekly_snapshots` ws2 WHERE ws2.`convex_game_id` = ws.`convex_game_id` ORDER BY `week` DESC LIMIT 1) as `latest_stress`
FROM `weekly_snapshots` ws
WHERE NOT EXISTS (SELECT 1 FROM `completed_games` cg WHERE cg.`convex_game_id` = ws.`convex_game_id`)
GROUP BY ws.`convex_game_id`, ws.`player_name`, ws.`persona_id`;
