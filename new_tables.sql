-- =============================================
-- Smart Gym AI Coach - New Tables SQL
-- Run this in phpMyAdmin → coach_ai database
-- =============================================

-- Results Chat (inner chat in AnalysisResult page)
CREATE TABLE IF NOT EXISTS `resultsChat` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `analysisId` int,
  `exercise` varchar(100) NOT NULL,
  `confidence` int DEFAULT 0,
  `level` varchar(50),
  `userMessage` text NOT NULL,
  `aiResponse` text NOT NULL,
  `language` varchar(10) DEFAULT 'en',
  `createdAt` timestamp NOT NULL DEFAULT now(),
  CONSTRAINT `resultsChat_id` PRIMARY KEY(`id`)
);

-- General Chat (outer chat in AdvancedAnalysis page)
CREATE TABLE IF NOT EXISTS `generalChat` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `sessionId` varchar(64),
  `sessionName` varchar(100),
  `userMessage` text NOT NULL,
  `aiResponse` text NOT NULL,
  `language` varchar(10) DEFAULT 'en',
  `createdAt` timestamp NOT NULL DEFAULT now(),
  CONSTRAINT `generalChat_id` PRIMARY KEY(`id`)
);

-- Error Analytics (track most common athlete errors)
CREATE TABLE IF NOT EXISTS `errorAnalytics` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `exercise` varchar(100) NOT NULL,
  `errorText` text NOT NULL,
  `count` int NOT NULL DEFAULT 1,
  `lastSeen` timestamp NOT NULL DEFAULT now(),
  `createdAt` timestamp NOT NULL DEFAULT now(),
  CONSTRAINT `errorAnalytics_id` PRIMARY KEY(`id`)
);
