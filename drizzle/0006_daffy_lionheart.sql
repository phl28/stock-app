ALTER TABLE "tradeup_positions" RENAME COLUMN "volume" TO "total_volume";--> statement-breakpoint
ALTER TABLE "tradeup_positions" RENAME COLUMN "averagePrice" TO "average_entry_price";--> statement-breakpoint
ALTER TABLE "tradeup_positions" RENAME COLUMN "realizedProfitLoss" TO "gross_profit_loss";--> statement-breakpoint
ALTER TABLE "tradeup_positions" RENAME COLUMN "totalCost" TO "total_fees";--> statement-breakpoint
ALTER TABLE "tradeup_positions" RENAME COLUMN "isShort" TO "is_short";--> statement-breakpoint
ALTER TABLE "tradeup_positions" RENAME COLUMN "createdBy" TO "created_by";--> statement-breakpoint
ALTER TABLE "tradeup_positions" RENAME COLUMN "openedAt" TO "opened_at";--> statement-breakpoint
ALTER TABLE "tradeup_positions" RENAME COLUMN "closedAt" TO "closed_at";--> statement-breakpoint
ALTER TABLE "tradeup_positions" RENAME COLUMN "lastUpdatedAt" TO "last_updated_at";--> statement-breakpoint
ALTER TABLE "tradeup_tradeHistory" RENAME COLUMN "tradeSide" TO "trade_side";--> statement-breakpoint
ALTER TABLE "tradeup_tradeHistory" RENAME COLUMN "executedAt" TO "executed_at";--> statement-breakpoint
DROP INDEX IF EXISTS "side_idx";--> statement-breakpoint
ALTER TABLE "tradeup_positions" ALTER COLUMN "gross_profit_loss" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tradeup_positions" ALTER COLUMN "gross_profit_loss" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tradeup_positions" ALTER COLUMN "is_short" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tradeup_positions" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "tradeup_positions" ADD COLUMN "outstanding_volume" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tradeup_positions" ADD COLUMN "average_exit_price" numeric(20, 8);--> statement-breakpoint
ALTER TABLE "tradeup_positions" ADD COLUMN "profit_target_price" numeric(20, 8);--> statement-breakpoint
ALTER TABLE "tradeup_positions" ADD COLUMN "stop_loss_price" numeric(20, 8);--> statement-breakpoint
ALTER TABLE "tradeup_positions" ADD COLUMN "num_trades" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tradeup_positions" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "tradeup_positions" ADD COLUMN "journal" jsonb;--> statement-breakpoint
ALTER TABLE "tradeup_tradeHistory" ADD COLUMN "position_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tradeup_tradeHistory" ADD CONSTRAINT "tradeup_tradeHistory_position_id_tradeup_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."tradeup_positions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "side_idx" ON "tradeup_tradeHistory" USING btree ("trade_side");--> statement-breakpoint
ALTER TABLE "tradeup_positions" DROP COLUMN IF EXISTS "closed";--> statement-breakpoint
ALTER TABLE "tradeup_tradeHistory" DROP COLUMN IF EXISTS "totalCost";--> statement-breakpoint
ALTER TABLE "tradeup_tradeHistory" DROP COLUMN IF EXISTS "profitLoss";--> statement-breakpoint
ALTER TABLE "tradeup_tradeHistory" DROP COLUMN IF EXISTS "notes";