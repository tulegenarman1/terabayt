CREATE TABLE `aiLogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text,
	`query` text NOT NULL,
	`normalizedKey` text NOT NULL,
	`aiUsed` integer NOT NULL,
	`reason` text NOT NULL,
	`confidenceScore` real,
	`response` text NOT NULL,
	`savings` integer DEFAULT 0 NOT NULL,
	`abTestGroup` text DEFAULT 'optimized' NOT NULL,
	`clickedProductId` integer,
	`addedToCart` integer DEFAULT false NOT NULL,
	`conversionValue` real DEFAULT 0,
	`responseTime` integer,
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`logo` text,
	`description` text,
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_unique` ON `brands` (`name`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cartItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`productId` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`sessionId` text NOT NULL,
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_cartItems`("id", "productId", "quantity", "sessionId", "createdAt", "updatedAt") SELECT "id", "productId", "quantity", "sessionId", "createdAt", "updatedAt" FROM `cartItems`;--> statement-breakpoint
DROP TABLE `cartItems`;--> statement-breakpoint
ALTER TABLE `__new_cartItems` RENAME TO `cartItems`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text,
	`description` text,
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "slug", "icon", "description", "createdAt", "updatedAt") SELECT "id", "name", "slug", "icon", "description", "createdAt", "updatedAt" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`categoryId` integer NOT NULL,
	`brandId` integer NOT NULL,
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
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "categoryId", "brandId", "name", "brand", "model", "price", "discountPrice", "description", "specs", "images", "videoUrl", "availability", "kaspiLink", "featured", "createdAt", "updatedAt") SELECT "id", "categoryId", "brandId", "name", "brand", "model", "price", "discountPrice", "description", "specs", "images", "videoUrl", "availability", "kaspiLink", "featured", "createdAt", "updatedAt" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE TABLE `__new_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`productId` integer NOT NULL,
	`rating` integer NOT NULL,
	`title` text NOT NULL,
	`comment` text,
	`authorName` text NOT NULL,
	`authorEmail` text,
	`verified` integer DEFAULT false NOT NULL,
	`helpful` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_reviews`("id", "productId", "rating", "title", "comment", "authorName", "authorEmail", "verified", "helpful", "createdAt", "updatedAt") SELECT "id", "productId", "rating", "title", "comment", "authorName", "authorEmail", "verified", "helpful", "createdAt", "updatedAt" FROM `reviews`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
ALTER TABLE `__new_reviews` RENAME TO `reviews`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL,
	`lastSignedIn` integer DEFAULT (cast(strftime('%s', 'now') as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn") SELECT "id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);