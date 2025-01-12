// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from 'drizzle-orm';
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
} from 'drizzle-orm/pg-core';

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
	'positions',
	{
		id: serial('id').primaryKey(),
		ticker: varchar('ticker', { length: 15 }).notNull(),
		region: region('region').notNull().default('US'),
		currency: currency('currency').notNull().default('USD'),
		totalVolume: integer('total_volume').notNull(),
		outstandingVolume: integer('outstanding_volume').notNull(),
		averageEntryPrice: decimal('average_entry_price', { precision: 20, scale: 8 }).notNull(),
		averageExitPrice: decimal('average_exit_price', { precision: 20, scale: 8 }),
		profitTargetPrice: decimal('profit_target_price', { precision: 20, scale: 8 }),
		stopLossPrice: decimal('stop_loss_price', { precision: 20, scale: 8 }),
		grossProfitLoss: decimal('gross_profit_loss', { precision: 20, scale: 8 }),
		totalFees: decimal('total_fees', { precision: 20, scale: 8 }).notNull(),
		numOfTrades: integer('num_trades').notNull(),
		isShort: boolean('is_short').notNull(),
		platform: platform('platform').notNull().default('FUTU'),
		notes: text('notes'),
		createdBy: text('created_by').notNull(),
		openedAt: timestamp('opened_at').notNull(),
		closedAt: timestamp('closed_at'),
		reviewedAt: timestamp('reviewed_at'),
		updatedAt: timestamp('updated_at').notNull(),
		journal: jsonb('journal')
	},
	(position) => ({
		tickerIndex: index('position_ticker_idx').on(position.ticker)
	})
);

export const tradeHistory = pgTable(
	'tradeHistory',
	{
		id: serial('id').primaryKey(),
		positionId: integer('position_id').references(() => positions.id, { onDelete: 'cascade' }),
		ticker: varchar('ticker', { length: 15 }).notNull(),
		region: region('region').notNull().default('US'),
		currency: currency('currency').notNull().default('USD'),
		price: decimal('price', { precision: 20, scale: 8 }).notNull(),
		fees: decimal('fees', { precision: 20, scale: 8 }).default('0'),
		volume: integer('volume').notNull(),
		platform: platform('platform').notNull().default('FUTU'),
		tradeSide: tradeSide('trade_side').notNull().default('BUY'),
		updatedAt: timestamp('updatedAt'),
		executedAt: timestamp('executed_at').notNull(),
		createdAt: timestamp('created_at')
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		createdBy: text('createdBy').notNull()
	},
	(trade) => ({
		tickerIndex: index('trade_ticker_idx').on(trade.ticker),
		platformIndex: index('platform_idx').on(trade.platform),
		sideIndex: index('side_idx').on(trade.tradeSide)
	})
);

export const articles = pgTable(
	'articles',
	{
		articleId: serial('article_id').primaryKey(),
		title: varchar('title', { length: 64 }).notNull(),
		content: jsonb('content'),
		createdAt: timestamp('created_at')
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		publishedAt: timestamp('published_at'),
		updatedAt: timestamp('updatedAt'),
		createdBy: text('createdBy').notNull()
	},
	(article) => ({
		titleSearchIndex: index('title_search_index').using(
			'gin',
			sql`to_tsvector('english', ${article.title})`
		),
		contentSearchIndex: index('content_search_index').using(
			'gin',
			sql`to_tsvector('english', ${article.content})`
		)
	})
);
