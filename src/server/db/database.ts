import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";

import * as schema from './schema';
import { eq, inArray, sql as dsql } from 'drizzle-orm';

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

export const updateTradeHistoryBatch = async (trades: Trade[]) => {
  const values = trades.map(trade => 
    `(${trade.id}, '${trade.ticker}', '${trade.region}', '${trade.currency}', ${trade.price}, ${trade.fees}, ${trade.volume}, '${trade.platform}', '${trade.tradeSide}', '${trade.executedAt}', ${trade.profitLoss || 'NULL'}, '${trade.notes}')`
  ).join(', ');

  console.log(values);

  const query = dsql`
    WITH updates(id, ticker, region, currency, price, fees, volume, platform, tradeside, executedAt, profitLoss, notes) AS (
      VALUES ${dsql.raw(values)}
    )
    UPDATE ${schema.tradeHistory} AS th
    SET
      ticker = u.ticker,
      region = u.region::region,
      currency = u.currency::currency,
      price = u.price,
      fees = u.fees,
      volume = u.volume,
      platform = u.platform::platform,
      tradeside = u.tradeside::"tradeSide",
      "executedAt" = u.executedAt::TIMESTAMP,
      "profitLoss" = u.profitLoss,
      notes = u.notes
    FROM updates AS u
    WHERE th.id = u.id;
  `;

  return await db.execute(query);
}

export const deleteTradeHistory = async (id: number) => {
    return await db.delete(schema.tradeHistory).where(eq(schema.tradeHistory.id, id));
}

export const deleteTradeHistoryBatch = async (ids: number[]) => {
    return await db.delete(schema.tradeHistory).where(inArray(schema.tradeHistory.id, ids));
}