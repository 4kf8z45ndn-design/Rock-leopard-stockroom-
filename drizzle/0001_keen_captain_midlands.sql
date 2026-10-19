CREATE TABLE `square_orders` (
	`workspace_id` text NOT NULL,
	`order_id` text NOT NULL,
	`payload` text NOT NULL,
	`status` text NOT NULL,
	`imported_at` text NOT NULL,
	`applied_version` integer,
	PRIMARY KEY(`workspace_id`, `order_id`),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
