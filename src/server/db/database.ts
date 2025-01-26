import { drizzle as VercelDrizzle, type VercelPgDatabase } from 'drizzle-orm/vercel-postgres';
import { drizzle as LocalDrizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from '@vercel/postgres';
import pkg from 'pg';

import * as schema from './schema';
import {
	eq,
	inArray,
	sql as dsql,
	and,
	gte,
	lte,
	desc,
	count,
	isNotNull,
	isNull
} from 'drizzle-orm';

let db: VercelPgDatabase<typeof schema> | NodePgDatabase<typeof schema>;
if (process.env.NODE_ENV === 'development') {
	const { Client } = pkg;
	const localClient = new Client({
		connectionString: process.env.POSTGRES_URL ?? ''
	});
	localClient.connect();
	db = LocalDrizzle(localClient, { schema });
} else {
	db = VercelDrizzle(sql, { schema });
}
export { db };

const tradeHistoryTable = schema.tradeHistory;
const positionsTable = schema.positions;
const articlesTable = schema.articles;

export type InsertTrade = typeof tradeHistoryTable.$inferInsert;
export type SelectTrade = typeof tradeHistoryTable.$inferSelect;
export type InsertPosition = typeof positionsTable.$inferInsert;
export type SelectPosition = typeof positionsTable.$inferSelect;
export type InsertArticle = typeof articlesTable.$inferInsert;
export type SelectArticle = typeof articlesTable.$inferSelect;

// Trade History
export const getAllUnassignedTradeHistory = async ({ userId }: { userId: string }) => {
	const tradeHistory = await db.query.tradeHistory.findMany({
		where: and(eq(tradeHistoryTable.createdBy, userId), isNull(tradeHistoryTable.positionId)),
		orderBy: [desc(tradeHistoryTable.executedAt), desc(tradeHistoryTable.createdAt)]
	});
	return tradeHistory;
};

export const getNumOfTradeHistory = async ({ userId }: { userId: string }) => {
	const counts = await db
		.select({ count: count() })
		.from(tradeHistoryTable)
		.where(eq(tradeHistoryTable.createdBy, userId));
	return counts;
};

export const getPaginatedTradeHistory = async ({
	pageNumber = 1,
	pageSize = 20,
	userId
}: {
	pageNumber?: number;
	pageSize?: number;
	userId: string;
}) => {
	const trades = await db
		.select()
		.from(tradeHistoryTable)
		.where(and(eq(tradeHistoryTable.createdBy, userId), isNull(tradeHistoryTable.positionId)))
		.orderBy(desc(tradeHistoryTable.executedAt), desc(tradeHistoryTable.createdAt))
		.limit(pageSize)
		.offset((pageNumber - 1) * pageSize);
	const counts = await getNumOfTradeHistory({ userId });
	const tradeCount = counts[0].count;
	return {
		trades,
		currentPage: pageNumber,
		totalPages: Math.ceil(Number(tradeCount) / pageSize),
		totalTrades: Number(tradeCount)
	};
};

export const getLastTradeHistory = async ({
	userId,
	platform
}: {
	userId: string;
	platform: 'FUTU' | 'IBKR';
}) => {
	const lastTrade = await db.query.tradeHistory.findFirst({
		where: and(eq(tradeHistoryTable.platform, platform), eq(tradeHistoryTable.createdBy, userId)),
		orderBy: [desc(tradeHistoryTable.executedAt)]
	});
	return lastTrade;
};

export const insertTradeHistory = async (trade: InsertTrade) => {
	trade.ticker = trade.ticker.toUpperCase();

	try {
		const result = await db.transaction(async (tx) => {
			const [insertedTrade] = await tx
				.insert(tradeHistoryTable)
				.values({
					...trade,
					updatedAt: new Date()
				})
				.returning();

			return insertedTrade;
		});
		return result;
	} catch (error) {
		throw error;
	}
};

// @FIXME: The functionality for this changed, we need this to update the whole trade now and not the notes
export const updateTradeHistoryBatch = async (trades: InsertTrade[]) => {
	const values = trades.map((trade) => dsql`(${trade.id}, ${new Date().toISOString()}::TIMESTAMP)`);

	const query = dsql`
    WITH updates(id, updatedAt) AS (
      VALUES ${dsql.join(values, ',')}
    )
    UPDATE ${tradeHistoryTable} AS th
    SET
      updated_at = u.updatedAt
    FROM updates AS u
    WHERE th.id = u.id::INTEGER
  `;

	return await db.execute(query);
};

export const deleteTradeHistory = async ({ id, userId }: { id: number; userId: string }) => {
	return await db.transaction(async (tx) => {
		const [deletedTrade] = await tx
			.delete(tradeHistoryTable)
			.where(and(eq(tradeHistoryTable.id, id), eq(tradeHistoryTable.createdBy, userId)))
			.returning();

		return deletedTrade;
	});
};

export const deleteTradeHistoryBatch = async ({
	userId,
	ids
}: {
	userId: string;
	ids: number[];
}) => {
	return await db.transaction(async (tx) => {
		const deletedTrades = await tx
			.delete(tradeHistoryTable)
			.where(and(inArray(tradeHistoryTable.id, ids), eq(tradeHistoryTable.createdBy, userId)))
			.returning();

		return deletedTrades;
	});
};

// Positions
export const assignTradesToPosition = async ({
	positionId,
	position,
	tradeIds
}: {
	positionId?: number;
	position: InsertPosition;
	tradeIds: number[];
}) => {
	await db.transaction(async (tx) => {
		let id = positionId;
		if (!id) {
			const ids = await tx
				.insert(positionsTable)
				.values({
					...position,
					updatedAt: new Date()
				})
				.returning({ id: positionsTable.id });
			id = ids[0].id;
		} else {
			await tx
				.update(positionsTable)
				.set({
					...position,
					updatedAt: new Date()
				})
				.where(eq(positionsTable.id, id));
		}
		await tx
			.update(tradeHistoryTable)
			.set({
				positionId: id,
				updatedAt: new Date()
			})
			.where(inArray(tradeHistoryTable.id, tradeIds));
	});
};

export const createNewPosition = async ({
	userId,
	position
}: {
	userId: string;
	position: InsertPosition;
}) => {
	return await db.transaction(async (tx) => {
		const [insertedPosition] = await tx
			.insert(positionsTable)
			.values({
				...position,
				createdBy: userId,
				updatedAt: new Date()
			})
			.returning();
		return insertedPosition;
	});
};

export const getPositions = async ({ userId }: { userId: string }) => {
	return await db.query.positions.findMany({
		where: and(eq(positionsTable.createdBy, userId)),
		orderBy: [desc(positionsTable.openedAt)]
	});
};

export const getClosedPositions = async ({
	userId,
	startDate,
	endDate
}: {
	userId: string;
	startDate: Date;
	endDate: Date;
}) => {
	return await db.query.positions.findMany({
		where: and(
			isNotNull(positionsTable.closedAt),
			gte(positionsTable.closedAt, startDate),
			lte(positionsTable.closedAt, endDate),
			eq(positionsTable.createdBy, userId)
		)
	});
};

export const getPosition = async ({
	positionId,
	userId
}: {
	positionId: number;
	userId: string;
}) => {
	const position = await db
		.select()
		.from(positionsTable)
		.where(and(eq(positionsTable.id, positionId), eq(positionsTable.createdBy, userId)));
	if (position.length === 1) {
		const trades = await db
			.select({
				id: tradeHistoryTable.id,
				executedAt: tradeHistoryTable.executedAt,
				price: tradeHistoryTable.price,
				fees: tradeHistoryTable.fees,
				volume: tradeHistoryTable.volume,
				tradeSide: tradeHistoryTable.tradeSide
			})
			.from(tradeHistoryTable)
			.where(eq(tradeHistoryTable.positionId, positionId))
			.orderBy(tradeHistoryTable.executedAt);
		return {
			position: position[0],
			trades
		};
	}
};

export const deletePosition = async ({
	userId,
	positionId
}: {
	userId: string;
	positionId: number;
}) => {
	return await db.transaction(async (tx) => {
		await tx
			.delete(positionsTable)
			.where(and(eq(positionsTable.id, positionId), eq(positionsTable.createdBy, userId)));
	});
};

export const markPositionReviewed = async ({
	positionId,
	userId
}: {
	positionId: number;
	userId: string;
}) => {
	return await db.transaction(async (tx) => {
		const [updatedPosition] = await tx
			.update(positionsTable)
			.set({
				reviewedAt: new Date(),
				updatedAt: new Date()
			})
			.where(and(eq(positionsTable.id, positionId), eq(positionsTable.createdBy, userId)))
			.returning();
		return updatedPosition;
	});
};

export const getPositionPerformance = async ({
	positionId,
	userId
}: {
	positionId: number;
	userId: string;
}) => {
	const position = await db.query.positions.findFirst({
		where: and(eq(positionsTable.id, positionId), eq(positionsTable.createdBy, userId))
	});

	if (position && position.closedAt) {
		const duration = position.closedAt.getTime() - position.openedAt.getTime();
		const durationDays = duration / (1000 * 60 * 60 * 24);
		const profitLoss = Number(position.grossProfitLoss);
		const roi =
			(profitLoss / Number(Number(position.averageEntryPrice) * position.totalVolume)) * 100;

		return {
			duration: durationDays,
			profitLoss,
			roi
		};
	}

	return null;
};

export const updatePositionNotes = async ({
	userId,
	position
}: {
	userId: string;
	position: Pick<InsertPosition, 'id' | 'notes'>;
}) => {
	const values = dsql`(${position.id}, ${position.notes})`;

	const query = dsql`
		WITH updates(id, notes) AS (
		VALUES ${values}
		)
		UPDATE ${positionsTable} AS p
		SET
		notes = u.notes
		FROM updates AS u
		WHERE p.id = u.id::INTEGER
		AND p.created_by = ${userId}
	`;

	return await db.execute(query);
};

export const updatePositionJournal = async ({
	userId,
	position
}: {
	userId: string;
	position: Pick<SelectPosition, 'id' | 'journal'>;
}) => {
	return await db.transaction(async (tx) => {
		const [updatedPosition] = await tx
			.update(positionsTable)
			.set({
				journal: position.journal
			})
			.where(and(eq(positionsTable.id, position.id), eq(positionsTable.createdBy, userId)))
			.returning();
		return updatedPosition;
	});
};

// Articles
export const getPaginatedArticles = async (
	pageSize: number,
	pageNumber: number = 1,
	published: boolean = true
) => {
	const condition = published ? isNotNull(articlesTable.publishedAt) : undefined;

	const articles = await db
		.select()
		.from(articlesTable)
		.where(condition)
		.orderBy(desc(articlesTable.articleId))
		.limit(pageSize)
		.offset((pageNumber - 1) * pageSize);
	const counts = await db.select({ count: count() }).from(articlesTable);
	const articleCount = counts[0].count;
	return {
		articles,
		currentPage: pageNumber,
		totalPages: Math.ceil(Number(articleCount) / pageSize),
		totalArticles: Number(articleCount)
	};
};

export const getArticle = async (articleId: number) => {
	return await db.select().from(articlesTable).where(eq(articlesTable.articleId, articleId));
};

export const searchArticles = async (searchTerm: string) => {
	const result = await db
		.select()
		.from(articlesTable)
		.where(
			dsql`to_tsvector('english', title) || to_tsvector('english', content) @@ plainto_tsquery('english', ${searchTerm})`
		);

	return {
		articles: result
	};
};

export const addArticle = async (article: InsertArticle) => {
	const [articleId] = await db
		.insert(articlesTable)
		.values(article)
		.returning({ articleId: articlesTable.articleId });
	return articleId;
};

export const updateArticle = async (article: InsertArticle, publish: boolean = false) => {
	if (!article.articleId) throw new Error('Article ID is required');
	if (publish) {
		article.publishedAt = new Date();
	} else {
		article.publishedAt = null;
	}
	return await db
		.update(articlesTable)
		.set(article)
		.where(eq(articlesTable.articleId, article.articleId));
};

export const deleteArticle = async ({
	userId,
	articleId
}: {
	userId: string;
	articleId: number;
}) => {
	return await db
		.delete(articlesTable)
		.where(and(eq(articlesTable.articleId, articleId), eq(articlesTable.createdBy, userId)));
};
