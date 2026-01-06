CREATE TABLE `cancellation_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`fullRefundDays` int DEFAULT 7,
	`partialRefundDays` int DEFAULT 3,
	`partialRefundPercent` int DEFAULT 50,
	`noRefundDays` int DEFAULT 0,
	`isDefault` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cancellation_policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guide_verification` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`bankCode` varchar(8),
	`bankName` varchar(128),
	`agencyNumber` varchar(16),
	`accountNumber` varchar(32),
	`accountType` enum('checking','savings') DEFAULT 'checking',
	`accountHolderName` varchar(256),
	`accountHolderDocument` varchar(32),
	`documentUrl` text,
	`bankProofUrl` text,
	`stripeAccountId` varchar(128),
	`stripeAccountStatus` varchar(64),
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`rejectionReason` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guide_verification_id` PRIMARY KEY(`id`),
	CONSTRAINT `guide_verification_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `payment_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('reservation','payment','payout','guide_verification') NOT NULL,
	`entityId` int NOT NULL,
	`action` varchar(64) NOT NULL,
	`previousValue` text,
	`newValue` text,
	`actorId` int,
	`actorType` enum('user','guide','admin','system') DEFAULT 'system',
	`ipAddress` varchar(64),
	`userAgent` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservationId` int NOT NULL,
	`stripePaymentIntentId` varchar(128) NOT NULL,
	`status` enum('pending','succeeded','failed','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
	`grossAmount` decimal(10,2) NOT NULL,
	`platformFee` decimal(10,2) NOT NULL,
	`stripeFee` decimal(10,2),
	`netAmount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('card','pix'),
	`currency` varchar(3) DEFAULT 'BRL',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guideId` int NOT NULL,
	`status` enum('scheduled','processing','sent','failed','completed') NOT NULL DEFAULT 'scheduled',
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'BRL',
	`stripeTransferId` varchar(128),
	`scheduledDate` timestamp NOT NULL,
	`processedAt` timestamp,
	`completedAt` timestamp,
	`paymentIds` json,
	`failureReason` text,
	`retryCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expeditionId` int NOT NULL,
	`userId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('created','pending_payment','paid','cancelled','refunded','no_show') NOT NULL DEFAULT 'created',
	`stripeCheckoutSessionId` varchar(128),
	`stripePaymentIntentId` varchar(128),
	`paymentMethod` enum('card','pix'),
	`expiresAt` timestamp,
	`paidAt` timestamp,
	`cancelledAt` timestamp,
	`cancellationReason` text,
	`cancelledBy` enum('user','guide','admin','system'),
	`refundedAt` timestamp,
	`refundAmount` decimal(10,2),
	`stripeRefundId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
