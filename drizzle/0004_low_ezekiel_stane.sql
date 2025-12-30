ALTER TABLE `trails` ADD `maxAltitude` int;--> statement-breakpoint
ALTER TABLE `trails` ADD `shortDescription` text;--> statement-breakpoint
ALTER TABLE `trails` ADD `hookText` text;--> statement-breakpoint
ALTER TABLE `trails` ADD `ctaText` text;--> statement-breakpoint
ALTER TABLE `trails` ADD `guideRequired` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `trails` ADD `entranceFee` varchar(64);--> statement-breakpoint
ALTER TABLE `trails` ADD `waterPoints` json;--> statement-breakpoint
ALTER TABLE `trails` ADD `campingPoints` json;--> statement-breakpoint
ALTER TABLE `trails` ADD `bestSeason` varchar(128);--> statement-breakpoint
ALTER TABLE `trails` ADD `estimatedTime` varchar(64);--> statement-breakpoint
ALTER TABLE `trails` ADD `trailType` enum('linear','circular','traverse') DEFAULT 'linear';--> statement-breakpoint
ALTER TABLE `trails` ADD `mapCoordinates` json;--> statement-breakpoint
ALTER TABLE `trails` ADD `highlights` json;--> statement-breakpoint
ALTER TABLE `trails` ADD `status` enum('draft','published') DEFAULT 'draft';