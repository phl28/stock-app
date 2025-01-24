import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';

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
	asc,
	isNull
} from 'drizzle-orm';

export const db = drizzle(sql, { schema });

export type InsertTrade = typeof schema.tradeHistory.$inferInsert;
export type SelectTrade = typeof schema.tradeHistory.$inferSelect;
export type InsertPosition = typeof schema.positions.$inferInsert;
export type SelectPosition = typeof schema.positions.$inferSelect;
export type InsertArticle = typeof schema.articles.$inferInsert;
export type SelectArticle = typeof schema.articles.$inferSelect;

// Trade History
export const getAllUnassignedTradeHistory = async ({ userId }: { userId: string }) => {
	const tradeHistory = await db.query.tradeHistory.findMany({
		where: and(eq(schema.tradeHistory.createdBy, userId), isNull(schema.tradeHistory.positionId)),
		orderBy: [desc(schema.tradeHistory.executedAt), desc(schema.tradeHistory.createdAt)]
	});
	return tradeHistory;
};

export const getNumOfTradeHistory = async ({ userId }: { userId: string }) => {
	const counts = await db
		.select({ count: count() })
		.from(schema.tradeHistory)
		.where(eq(schema.tradeHistory.createdBy, userId));
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
		.from(schema.tradeHistory)
		.where(eq(schema.tradeHistory.createdBy, userId))
		.orderBy(desc(schema.tradeHistory.executedAt), desc(schema.tradeHistory.createdAt))
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
		where: and(
			eq(schema.tradeHistory.platform, platform),
			eq(schema.tradeHistory.createdBy, userId)
		),
		orderBy: [desc(schema.tradeHistory.executedAt)]
	});
	return lastTrade;
};

export const insertTradeHistory = async (trade: InsertTrade) => {
	trade.ticker = trade.ticker.toUpperCase();

	try {
		const result = await db.transaction(async (tx) => {
			const [insertedTrade] = await tx
				.insert(schema.tradeHistory)
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
    UPDATE ${schema.tradeHistory} AS th
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
			.delete(schema.tradeHistory)
			.where(and(eq(schema.tradeHistory.id, id), eq(schema.tradeHistory.createdBy, userId)))
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
			.delete(schema.tradeHistory)
			.where(and(inArray(schema.tradeHistory.id, ids), eq(schema.tradeHistory.createdBy, userId)))
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
	position?: InsertPosition;
	tradeIds: number[];
}) => {
	await db.transaction(async (tx) => {
		let id = positionId;
		if (position) {
			const ids = await tx
				.insert(schema.positions)
				.values({
					...position,
					updatedAt: new Date()
				})
				.returning({ id: schema.positions.id });
			id = ids[0].id;
		}
		await tx
			.update(schema.tradeHistory)
			.set({
				positionId: id,
				updatedAt: new Date()
			})
			.where(inArray(schema.tradeHistory.id, tradeIds));
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
			.insert(schema.positions)
			.values({
				...position,
				createdBy: userId,
				updatedAt: new Date()
			})
			.returning();
		return insertedPosition;
	});
};

export const getActivePositions = async ({ userId }: { userId: string }) => {
	return await db.query.positions.findMany({
		where: and(eq(schema.positions.createdBy, userId), isNull(schema.positions.closedAt)),
		orderBy: [desc(schema.positions.openedAt)]
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
			isNotNull(schema.positions.closedAt),
			gte(schema.positions.closedAt, startDate),
			lte(schema.positions.closedAt, endDate),
			eq(schema.positions.createdBy, userId)
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
		.from(schema.positions)
		.where(and(eq(schema.positions.id, positionId), eq(schema.positions.createdBy, userId)));
	if (position.length === 1) {
		const trades = await db
			.select({
				id: schema.tradeHistory.id,
				executedAt: schema.tradeHistory.executedAt,
				price: schema.tradeHistory.price,
				fees: schema.tradeHistory.fees,
				volume: schema.tradeHistory.volume,
				tradeSide: schema.tradeHistory.tradeSide
			})
			.from(schema.tradeHistory)
			.where(eq(schema.tradeHistory.positionId, positionId));
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
			.delete(schema.positions)
			.where(and(eq(schema.positions.id, positionId), eq(schema.positions.createdBy, userId)));
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
			.update(schema.positions)
			.set({
				reviewedAt: new Date(),
				updatedAt: new Date()
			})
			.where(and(eq(schema.positions.id, positionId), eq(schema.positions.createdBy, userId)))
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
		where: and(eq(schema.positions.id, positionId), eq(schema.positions.createdBy, userId))
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
		UPDATE ${schema.positions} AS p
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
			.update(schema.positions)
			.set({
				journal: position.journal
			})
			.where(and(eq(schema.positions.id, position.id), eq(schema.positions.createdBy, userId)))
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
	const condition = published ? isNotNull(schema.articles.publishedAt) : undefined;

	const articles = await db
		.select()
		.from(schema.articles)
		.where(condition)
		.orderBy(desc(schema.articles.articleId))
		.limit(pageSize)
		.offset((pageNumber - 1) * pageSize);
	const counts = await db.select({ count: count() }).from(schema.articles);
	const articleCount = counts[0].count;
	return {
		articles,
		currentPage: pageNumber,
		totalPages: Math.ceil(Number(articleCount) / pageSize),
		totalArticles: Number(articleCount)
	};
};

export const getArticle = async (articleId: number) => {
	return await db.select().from(schema.articles).where(eq(schema.articles.articleId, articleId));
};

export const searchArticles = async (searchTerm: string) => {
	const result = await db
		.select()
		.from(schema.articles)
		.where(
			dsql`to_tsvector('english', title) || to_tsvector('english', content) @@ plainto_tsquery('english', ${searchTerm})`
		);

	return {
		articles: result
	};
};

export const addArticle = async (article: InsertArticle) => {
	const [articleId] = await db
		.insert(schema.articles)
		.values(article)
		.returning({ articleId: schema.articles.articleId });
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
		.update(schema.articles)
		.set(article)
		.where(eq(schema.articles.articleId, article.articleId));
};

export const deleteArticle = async ({
	userId,
	articleId
}: {
	userId: string;
	articleId: number;
}) => {
	return await db
		.delete(schema.articles)
		.where(and(eq(schema.articles.articleId, articleId), eq(schema.articles.createdBy, userId)));
};
