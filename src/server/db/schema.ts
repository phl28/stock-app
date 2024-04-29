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
  boolean
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

export const tradeHistory = pgTable(
  "tradeHistory",
  {
    id: serial("id").primaryKey(),
    ticker: varchar('ticker', { length: 15 }).notNull(),
    region: region('region').notNull(),
    volume: integer('volume').notNull(),
    platform: platform('platform').notNull(),
    side: tradeSide('tradeSide').notNull(),
    executedAt: timestamp('executedAt').notNull(),
    openPosition: boolean('openPosition').notNull(),
    notes: text('text'),

    createdAt: timestamp('created_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updatedAt'),
  },
  (example) => ({
    tickerIndex: index("ticker_idx").on(example.ticker),
  }),
);