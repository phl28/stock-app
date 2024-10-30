ALTER TABLE "tradeup_articles" ADD COLUMN "published_at" timestamp;

UPDATE "tradeup_articles" SET "published_at" = "created_at" WHERE "published_at" IS NULL AND "created_at" IS NOT NULL;
