CREATE TABLE `cartItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`productId` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`sessionId` text NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`categoryId` integer NOT NULL,
	`name` text NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`price` real NOT NULL,
	`discountPrice` real,
	`description` text,
	`specs` text,
	`images` text,
	`videoUrl` text,
	`availability` text DEFAULT 'in_stock' NOT NULL,
	`kaspiLink` text,
	`featured` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`productId` integer NOT NULL,
	`rating` integer NOT NULL,
	`title` text NOT NULL,
	`comment` text,
	`authorName` text NOT NULL,
	`authorEmail` text,
	`verified` integer DEFAULT false NOT NULL,
	`helpful` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL,
	`lastSignedIn` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);
