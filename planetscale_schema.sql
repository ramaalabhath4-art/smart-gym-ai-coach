-- ============================================================
-- Smart Gym AI Coach — PlanetScale Schema
-- ============================================================
-- PlanetScale uses Vitess which does NOT support foreign keys.
-- All REFERENCES/FOREIGN KEY lines are removed intentionally.
-- Run this in PlanetScale → your database → Console tab.
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`             int          NOT NULL AUTO_INCREMENT,
  `openId`         varchar(64)  NOT NULL,
  `name`           text,
  `email`          varchar(320),
  `password`       varchar(200),
  `loginMethod`    varchar(64),
  `role`           enum('user','admin')            NOT NULL DEFAULT 'user',
  `subscription`   enum('free','pro','elite')      NOT NULL DEFAULT 'free',
  `totalSessions`  int          NOT NULL DEFAULT 0,
  `totalExercises` int          NOT NULL DEFAULT 0,
  `createdAt`      timestamp    NOT NULL DEFAULT now(),
  `updatedAt`      timestamp    NOT NULL DEFAULT now() ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn`   timestamp    NOT NULL DEFAULT now(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
);

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id`             int          NOT NULL AUTO_INCREMENT,
  `userId`         int          NOT NULL,
  `plan`           enum('free','pro','elite')        NOT NULL DEFAULT 'free',
  `status`         enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
  `paymentMethod`  varchar(50),
  `lastFourDigits` varchar(4),
  `startDate`      timestamp    NOT NULL DEFAULT now(),
  `endDate`        timestamp    NULL,
  `autoRenew`      tinyint(1)   NOT NULL DEFAULT 1,
  `price`          float        DEFAULT 0,
  `currency`       varchar(3)   DEFAULT 'USD',
  `createdAt`      timestamp    NOT NULL DEFAULT now(),
  `updatedAt`      timestamp    NOT NULL DEFAULT now() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subscriptions_userId` (`userId`)
);

-- ── ANALYSIS HISTORY ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `analysisHistory` (
  `id`              int          NOT NULL AUTO_INCREMENT,
  `userId`          int          NOT NULL,
  `exerciseClass`   varchar(100) NOT NULL,
  `confidence`      int          NOT NULL,
  `similarityScore` int          NOT NULL,
  `level`           varchar(50),
  `dtwDistance`     float,
  `corrections`     text,
  `qualityIssues`   text,
  `videoUrl`        text,
  `createdAt`       timestamp    NOT NULL DEFAULT now(),
  PRIMARY KEY (`id`),
  KEY `idx_analysisHistory_userId` (`userId`)
);

-- ── MOVEMENT DATA ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `movementData` (
  `id`            int          NOT NULL AUTO_INCREMENT,
  `userId`        int          NOT NULL,
  `analysisId`    int,
  `exerciseClass` varchar(100) NOT NULL,
  `keypoints`     json,
  `angles`        json,
  `dtwSequence`   json,
  `frameCount`    int          DEFAULT 15,
  `sessionDate`   timestamp    NOT NULL DEFAULT now(),
  `createdAt`     timestamp    NOT NULL DEFAULT now(),
  PRIMARY KEY (`id`),
  KEY `idx_movementData_userId` (`userId`)
);

-- ── PAYMENT ACCOUNTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `paymentAccounts` (
  `id`             int          NOT NULL AUTO_INCREMENT,
  `userId`         int          NOT NULL,
  `cardholderName` varchar(100) NOT NULL,
  `cardNumber`     varchar(255) NOT NULL,
  `expiryDate`     varchar(255) NOT NULL,
  `cvv`            varchar(255) NOT NULL,
  `lastFourDigits` varchar(4)   NOT NULL,
  `isDefault`      tinyint(1)   NOT NULL DEFAULT 1,
  `createdAt`      timestamp    NOT NULL DEFAULT now(),
  `updatedAt`      timestamp    NOT NULL DEFAULT now() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_paymentAccounts_userId` (`userId`)
);

-- ── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `messages` (
  `id`        int       NOT NULL AUTO_INCREMENT,
  `userId`    int       NOT NULL,
  `content`   text      NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT now(),
  `updatedAt` timestamp NOT NULL DEFAULT now() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_userId` (`userId`)
);

-- ── RESULTS CHAT ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `resultsChat` (
  `id`          int          NOT NULL AUTO_INCREMENT,
  `userId`      int          NOT NULL,
  `analysisId`  int,
  `exercise`    varchar(100) NOT NULL,
  `confidence`  int          DEFAULT 0,
  `level`       varchar(50),
  `userMessage` text         NOT NULL,
  `aiResponse`  text         NOT NULL,
  `language`    varchar(10)  DEFAULT 'en',
  `createdAt`   timestamp    NOT NULL DEFAULT now(),
  PRIMARY KEY (`id`),
  KEY `idx_resultsChat_userId` (`userId`)
);

-- ── GENERAL CHAT ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `generalChat` (
  `id`          int          NOT NULL AUTO_INCREMENT,
  `userId`      int          NOT NULL,
  `sessionId`   varchar(64),
  `sessionName` varchar(100),
  `userMessage` text         NOT NULL,
  `aiResponse`  text         NOT NULL,
  `language`    varchar(10)  DEFAULT 'en',
  `createdAt`   timestamp    NOT NULL DEFAULT now(),
  PRIMARY KEY (`id`),
  KEY `idx_generalChat_userId` (`userId`)
);

-- ── ERROR ANALYTICS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `errorAnalytics` (
  `id`        int          NOT NULL AUTO_INCREMENT,
  `userId`    int          NOT NULL,
  `exercise`  varchar(100) NOT NULL,
  `errorText` text         NOT NULL,
  `count`     int          NOT NULL DEFAULT 1,
  `lastSeen`  timestamp    NOT NULL DEFAULT now(),
  `createdAt` timestamp    NOT NULL DEFAULT now(),
  PRIMARY KEY (`id`),
  KEY `idx_errorAnalytics_userId` (`userId`)
);
