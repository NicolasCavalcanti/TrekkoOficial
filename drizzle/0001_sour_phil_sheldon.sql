CREATE TABLE `expedition_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expeditionId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('interested','confirmed','cancelled') DEFAULT 'interested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expedition_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expeditions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guideId` int NOT NULL,
	`trailId` int NOT NULL,
	`title` varchar(256),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`capacity` int DEFAULT 10,
	`availableSpots` int DEFAULT 10,
	`price` decimal(10,2),
	`meetingPoint` text,
	`notes` text,
	`status` enum('draft','published','cancelled','completed') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expeditions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trailId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guide_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cadasturNumber` varchar(64) NOT NULL,
	`cadasturValidatedAt` timestamp,
	`cadasturExpiresAt` timestamp,
	`uf` varchar(2),
	`city` varchar(128),
	`categories` json,
	`languages` json,
	`contactPhone` varchar(32),
	`contactEmail` varchar(320),
	`website` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guide_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(64) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('info','warning','error') DEFAULT 'info',
	`actorId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`uf` varchar(2) NOT NULL,
	`city` varchar(128),
	`region` varchar(256),
	`park` varchar(256),
	`distanceKm` decimal(8,2),
	`elevationGain` int,
	`difficulty` enum('easy','moderate','hard','expert') DEFAULT 'moderate',
	`description` text,
	`imageUrl` text,
	`images` json,
	`source` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('trekker','guide') DEFAULT 'trekker' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `photoUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `cadasturNumber` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `cadasturValidated` int DEFAULT 0;