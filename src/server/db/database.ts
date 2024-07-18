import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";
import type { Trade } from "../../lib/types/tradeTypes";

import * as schema from './schema';

// Use this object to send drizzle queries to your DB
export const db = drizzle(sql, {schema});

export const getAllTradeHistory = async () => {
    return await db.query.tradeHistory.findMany();
  };

// export const insertTradeHistory = async (trade: Trade) => {
//     trade.ticker = trade.ticker.toUpperCase();
//     return db.insert(schema.tradeHistory).values({
//         ticker: trade.ticker,
//         region: trade.region,
//         currency: trade.currency,
//         price: trade.price,
//         fees: trade.fees,
//         totalValue: trade.totalValue,
//         volume: trade.volume,
//         platform: trade.platform,
//         side: trade.side,
//         executedAt: trade.executedAt,
//         profitLoss: trade.profitLoss,
//         notes: trade.notes
//     });
// }