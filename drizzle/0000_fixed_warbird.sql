CREATE TABLE `game_results` (
	`id` integer PRIMARY KEY NOT NULL,
	`final_spain` integer,
	`final_argentina` integer,
	`bronze_france` integer,
	`bronze_england` integer,
	`champion` text DEFAULT '' NOT NULL,
	`bonus` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `picks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`final_spain` integer NOT NULL,
	`final_argentina` integer NOT NULL,
	`bronze_france` integer NOT NULL,
	`bronze_england` integer NOT NULL,
	`champion` text NOT NULL,
	`bonus` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
