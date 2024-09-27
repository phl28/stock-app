// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  pgEnum,
  text,
  integer,
  decimal,
  boolean,
  jsonb
} from "drizzle-orm/pg-core";

/**
* This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
* database instance for multiple projects.
*
* @see https://orm.drizzle.team/docs/goodies#multi-project-schema
*/
export const pgTable = pgTableCreator((name) => `tradeup_${name}`);

export const region = pgEnum('region', ['US', 'HK', 'UK']);
export const platform = pgEnum('platform', ['FUTU', 'IBKR']);
export const tradeSide = pgEnum('tradeSide', ['BUY', 'SELL']);
export const currency = pgEnum('currency', ['USD', 'HKD', 'EUR', 'GBP', 'CNY']);

export const positions = pgTable(
  "positions",
  {
    id: serial("id").primaryKey(),
    ticker: varchar('ticker', { length: 15 }).notNull(),
    region: region('region').notNull().default('US'),
    volume: integer('volume').notNull(),
    averagePrice: decimal('averagePrice', { precision: 20, scale: 8 }).notNull(),
    totalCost: decimal('totalCost',  { precision: 20, scale: 8 }).notNull(),
    realizedProfitLoss: decimal('realizedProfitLoss',  { precision: 20, scale: 8 }).notNull().default('0'),
    isShort: boolean('isShort').notNull().default(false),
    openedAt: timestamp('openedAt').notNull(),
    lastUpdatedAt: timestamp('lastUpdatedAt').notNull(),
    platform: platform('platform').notNull().default('FUTU'),
    notes: text('notes'),
    closed: boolean('closed').notNull().default(false),
    closedAt: timestamp('closedAt'),
  },
  (position) => ({
    tickerIndex: index("position_ticker_idx").on(position.ticker),
  }),
);

export const tradeHistory = pgTable(
  "tradeHistory",
  {
    id: serial("id").primaryKey(),
    ticker: varchar('ticker', { length: 15 }).notNull(),
    region: region('region').notNull().default('US'),
    currency: currency('currency').notNull().default('USD'),
    price: decimal('price',  { precision: 20, scale: 8 }).notNull(),
    fees: decimal('fees',  { precision: 20, scale: 8 }).default('0'),
    totalCost: decimal('totalCost',  { precision: 20, scale: 8 }).notNull(),
    volume: integer('volume').notNull(),
    platform: platform('platform').notNull().default('FUTU'),
    tradeSide: tradeSide('tradeSide').notNull().default('BUY'),
    executedAt: timestamp('executedAt').notNull(),
    profitLoss: decimal('profitLoss',  { precision: 20, scale: 8 }),
    notes: text('notes'),

    createdAt: timestamp('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updatedAt'),
  },
  (trade) => ({
    tickerIndex: index("trade_ticker_idx").on(trade.ticker),
    platformIndex: index("platform_idx").on(trade.platform),
    sideIndex: index("side_idx").on(trade.tradeSide),
  }),
);

export const articles = pgTable(
  "articles",
  {
    articleId: serial("article_id").primaryKey(),
    title: varchar('title', { length: 64 }).notNull(),
    content: jsonb('content').notNull(),
    createdAt: timestamp('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updatedAt'),
  },
  (article) => ({
      titleSearchIndex: index('title_search_index')
      .using('gin', sql`to_tsvector('english', ${article.title})`),
    }),

)