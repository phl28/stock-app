import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";

import * as schema from './schema';
import { eq, inArray } from 'drizzle-orm';

// Use this object to send drizzle queries to your DB
export const db = drizzle(sql, {schema});

type Trade = typeof schema.tradeHistory.$inferInsert
type Position = typeof schema.positions.$inferInsert

export const getAllTradeHistory = async () => {
    return await db.query.tradeHistory.findMany();
  };

export const insertTradeHistory = async (trade: Trade) => {
    trade.ticker = trade.ticker.toUpperCase();
    return await db.insert(schema.tradeHistory).values(trade);
}

export const deleteTradeHistory = async (id: number) => {
    return await db.delete(schema.tradeHistory).where(eq(schema.tradeHistory.id, id));
}

export const deleteTradeHistoryBatch = async (ids: number[]) => {
    return await db.delete(schema.tradeHistory).where(inArray(schema.tradeHistory.id, ids));
}