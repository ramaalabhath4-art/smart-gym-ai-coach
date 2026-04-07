CREATE TABLE `movementData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`analysisId` int,
	`exerciseClass` varchar(100) NOT NULL,
	`keypoints` json,
	`angles` json,
	`dtwSequence` json,
	`frameCount` int DEFAULT 15,
	`sessionDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `movementData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','pro','elite') NOT NULL DEFAULT 'free',
	`status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
	`paymentMethod` varchar(50),
	`lastFourDigits` varchar(4),
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`autoRenew` boolean NOT NULL DEFAULT true,
	`price` float DEFAULT 0,
	`currency` varchar(3) DEFAULT 'USD',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analysisHistory` ADD `level` varchar(50);--> statement-breakpoint
ALTER TABLE `analysisHistory` ADD `dtwDistance` float;--> statement-breakpoint
ALTER TABLE `analysisHistory` ADD `qualityIssues` text;--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(200);--> statement-breakpoint
ALTER TABLE `users` ADD `subscription` enum('free','pro','elite') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalSessions` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalExercises` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `movementData` ADD CONSTRAINT `movementData_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `movementData` ADD CONSTRAINT `movementData_analysisId_analysisHistory_id_fk` FOREIGN KEY (`analysisId`) REFERENCES `analysisHistory`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;