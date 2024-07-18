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
  decimal
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
export const tradeSide = pgEnum('tradeSide', ['BUY', 'SELL', 'BUY_BACK']);
export const currency = pgEnum('currency', ['USD', 'HKD', 'EUR', 'GBP', 'CNY']);

export const positions = pgTable(
  "positions",
  {
    id: serial("id").primaryKey(),
    ticker: varchar('ticker', { length: 15 }).notNull(),
    region: region('region').notNull(),
    openVolume: integer('openVolume').notNull(),
    averageOpenPrice: decimal('averageOpenPrice', { precision: 10, scale: 2 }).notNull(),
    totalCost: decimal('totalCost', { precision: 10, scale: 2 }).notNull(),
    openedAt: timestamp('openedAt').notNull(),
    lastUpdatedAt: timestamp('lastUpdatedAt').notNull(),
    platform: platform('platform').notNull(),
    notes: text('notes'),
  },
  (position) => ({
    tickerIndex: index("position_ticker_idx").on(position.ticker),
  }),
);

export const tradeHistory = pgTable(
  "tradeHistory",
  {
    id: serial("id").primaryKey(),
    positionId: integer('positionId').references(() => positions.id),
    ticker: varchar('ticker', { length: 15 }).notNull(),
    region: region('region').notNull().default('US'),
    currency: currency('currency').notNull().default('USD'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    fees: decimal('fees', { precision: 10, scale: 2 }).default('0'),
    totalValue: decimal('totalValue', { precision: 10, scale: 2 }).notNull(),
    volume: integer('volume').notNull(),
    platform: platform('platform').notNull().default('FUTU'),
    side: tradeSide('tradeSide').notNull().default('BUY'),
    executedAt: timestamp('executedAt').notNull(),
    profitLoss: decimal('profitLoss', { precision: 10, scale: 2 }),
    notes: text('notes'),

    createdAt: timestamp('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updatedAt'),
  },
  (trade) => ({
    tickerIndex: index("trade_ticker_idx").on(trade.ticker),
    positionIndex: index("position_id_idx").on(trade.positionId),
  }),
);