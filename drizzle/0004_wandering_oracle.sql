ALTER TABLE "tradeup_articles" ADD COLUMN "createdBy" text;--> statement-breakpoint
ALTER TABLE "tradeup_positions" ADD COLUMN "createdBy" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tradeup_tradeHistory" ADD COLUMN "createdBy" text NOT NULL;