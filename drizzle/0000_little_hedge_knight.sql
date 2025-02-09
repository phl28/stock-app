DO $$ BEGIN
 CREATE TYPE "public"."currency" AS ENUM('USD', 'HKD', 'EUR', 'GBP', 'CNY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."platform" AS ENUM('FUTU', 'IBKR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."region" AS ENUM('US', 'HK', 'UK');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tradeSide" AS ENUM('BUY', 'SELL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tradeup_articles" (
	"article_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(64) NOT NULL,
	"content" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"published_at" timestamp,
	"updatedAt" timestamp,
	"createdBy" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tradeup_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" varchar(15) NOT NULL,
	"region" "region" DEFAULT 'US' NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"total_volume" integer NOT NULL,
	"outstanding_volume" integer NOT NULL,
	"average_entry_price" numeric(20, 8) NOT NULL,
	"average_exit_price" numeric(20, 8),
	"profit_target_price" numeric(20, 8),
	"stop_loss_price" numeric(20, 8),
	"gross_profit_loss" numeric(20, 8),
	"total_fees" numeric(20, 8) NOT NULL,
	"num_trades" integer NOT NULL,
	"is_short" boolean NOT NULL,
	"platform" "platform" DEFAULT 'FUTU' NOT NULL,
	"notes" text,
	"created_by" text NOT NULL,
	"opened_at" timestamp NOT NULL,
	"closed_at" timestamp,
	"reviewed_at" timestamp,
	"updated_at" timestamp NOT NULL,
	"journal" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tradeup_tradeHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"position_id" integer,
	"ticker" varchar(15) NOT NULL,
	"region" "region" DEFAULT 'US' NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"price" numeric(20, 8) NOT NULL,
	"fees" numeric(20, 8) DEFAULT '0',
	"volume" integer NOT NULL,
	"platform" "platform" DEFAULT 'FUTU' NOT NULL,
	"trade_side" "tradeSide" DEFAULT 'BUY' NOT NULL,
	"updated_at" timestamp,
	"executed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tradeup_tradeHistory" ADD CONSTRAINT "tradeup_tradeHistory_position_id_tradeup_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."tradeup_positions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "title_search_index" ON "tradeup_articles" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_search_index" ON "tradeup_articles" USING gin (to_tsvector('english', "content"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "position_ticker_idx" ON "tradeup_positions" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trade_ticker_idx" ON "tradeup_tradeHistory" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_idx" ON "tradeup_tradeHistory" USING btree ("platform");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "side_idx" ON "tradeup_tradeHistory" USING btree ("trade_side");