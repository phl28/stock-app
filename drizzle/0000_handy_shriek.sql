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
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tradeup_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" varchar(15) NOT NULL,
	"region" "region" DEFAULT 'US' NOT NULL,
	"volume" integer NOT NULL,
	"averagePrice" numeric(20, 8) NOT NULL,
	"totalCost" numeric(20, 8) NOT NULL,
	"realizedProfitLoss" numeric(20, 8) DEFAULT '0' NOT NULL,
	"isShort" boolean DEFAULT false NOT NULL,
	"openedAt" timestamp NOT NULL,
	"lastUpdatedAt" timestamp NOT NULL,
	"platform" "platform" DEFAULT 'FUTU' NOT NULL,
	"notes" text,
	"closed" boolean DEFAULT false NOT NULL,
	"closedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tradeup_tradeHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" varchar(15) NOT NULL,
	"region" "region" DEFAULT 'US' NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"price" numeric(20, 8) NOT NULL,
	"fees" numeric(20, 8) DEFAULT '0',
	"totalCost" numeric(20, 8) NOT NULL,
	"volume" integer NOT NULL,
	"platform" "platform" DEFAULT 'FUTU' NOT NULL,
	"tradeSide" "tradeSide" DEFAULT 'BUY' NOT NULL,
	"executedAt" timestamp NOT NULL,
	"profitLoss" numeric(20, 8),
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "title_search_index" ON "tradeup_articles" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "position_ticker_idx" ON "tradeup_positions" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trade_ticker_idx" ON "tradeup_tradeHistory" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "platform_idx" ON "tradeup_tradeHistory" USING btree ("platform");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "side_idx" ON "tradeup_tradeHistory" USING btree ("tradeSide");