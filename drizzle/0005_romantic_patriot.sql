ALTER TABLE `expeditions` MODIFY COLUMN `status` enum('draft','active','full','closed','cancelled') DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `expeditions` ADD `description` text;--> statement-breakpoint
ALTER TABLE `expeditions` ADD `startTime` varchar(8);--> statement-breakpoint
ALTER TABLE `expeditions` ADD `endTime` varchar(8);--> statement-breakpoint
ALTER TABLE `expeditions` ADD `enrolledCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `expeditions` ADD `guideNotes` text;--> statement-breakpoint
ALTER TABLE `expeditions` ADD `includedItems` json;--> statement-breakpoint
ALTER TABLE `expeditions` ADD `images` json;--> statement-breakpoint
ALTER TABLE `expeditions` DROP COLUMN `availableSpots`;--> statement-breakpoint
ALTER TABLE `expeditions` DROP COLUMN `notes`;