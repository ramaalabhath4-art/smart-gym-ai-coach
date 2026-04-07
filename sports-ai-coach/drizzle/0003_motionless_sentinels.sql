CREATE TABLE `paymentAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cardholderName` varchar(100) NOT NULL,
	`cardNumber` varchar(255) NOT NULL,
	`expiryDate` varchar(255) NOT NULL,
	`cvv` varchar(255) NOT NULL,
	`lastFourDigits` varchar(4) NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `paymentAccounts` ADD CONSTRAINT `paymentAccounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;