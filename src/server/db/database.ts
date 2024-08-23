import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";

import * as schema from './schema';
import { eq, inArray, sql as dsql, and, gte, lte } from 'drizzle-orm';

export const db = drizzle(sql, {schema});

export type Trade = typeof schema.tradeHistory.$inferInsert
export type Position = typeof schema.positions.$inferInsert

export const getAllTradeHistory = async () => {
    return await db.query.tradeHistory.findMany();
};

export const getPositions = async () => {
  return await db.query.positions.findMany();
}

export const insertTradeHistory = async (trade: Trade) => {
  trade.ticker = trade.ticker.toUpperCase();

  return await db.transaction(async (tx) => {
    const [insertedTrade] = await tx.insert(schema.tradeHistory).values({
      ...trade,
      updatedAt: new Date(),
    }).returning();

    const existingPosition = await tx.query.positions.findFirst({
      where: and(
        eq(schema.positions.ticker, trade.ticker),
        eq(schema.positions.platform, trade.platform as any),
        eq(schema.positions.region, trade.region as any)
      ),
    });

    if (existingPosition) {
      let updatedVolume, updatedTotalCost, updatedAveragePrice, realizedProfitLoss;

      if (trade.tradeSide === 'BUY') {
        updatedVolume = existingPosition.volume + trade.volume;
        updatedTotalCost = Number(existingPosition.totalCost) + Number(trade.totalCost);
        updatedAveragePrice = updatedTotalCost / updatedVolume;
        realizedProfitLoss = Number(existingPosition.realizedProfitLoss);
      } else {
        updatedVolume = existingPosition.volume - trade.volume;
        updatedTotalCost = Number(existingPosition.totalCost) - (Number(existingPosition.averagePrice) * trade.volume);
        realizedProfitLoss = Number(existingPosition.realizedProfitLoss) + 
          (Number(trade.price) - Number(existingPosition.averagePrice)) * trade.volume - Number(trade.fees);
        updatedAveragePrice = updatedVolume > 0 ? updatedTotalCost / updatedVolume : 0;
      }

      if (updatedVolume === 0) {
        await tx.update(schema.positions)
          .set({
            volume: updatedVolume,
            totalCost: String(updatedTotalCost),
            averagePrice: String(updatedAveragePrice),
            lastUpdatedAt: new Date(),
            realizedProfitLoss: String(realizedProfitLoss),
            closed: true,
            closedAt: new Date(),
          })
          .where(eq(schema.positions.id, existingPosition.id));
      } else {
        await tx.update(schema.positions)
          .set({
            volume: updatedVolume,
            totalCost: String(updatedTotalCost),
            averagePrice: String(updatedAveragePrice),
            lastUpdatedAt: new Date(),
            realizedProfitLoss: String(realizedProfitLoss),
          })
          .where(eq(schema.positions.id, existingPosition.id));
        }
    } else {
      const newPosition: Position = {
        ticker: trade.ticker,
        region: trade.region,
        volume: trade.volume,
        averagePrice: trade.price,
        totalCost: trade.totalCost,
        openedAt: trade.executedAt,
        lastUpdatedAt: new Date(),
        platform: trade.platform,
        notes: '',
        realizedProfitLoss: '0',
      };

      await tx.insert(schema.positions).values(newPosition);
    }

    return insertedTrade;
  });
};

export const updateTradeHistoryBatch = async (trades: Trade[]) => {
  const values = trades.map(trade => 
    `(${trade.id}, '${trade.ticker}', '${trade.region}', '${trade.currency}', ${trade.price}, ${trade.fees}, ${trade.volume}, '${trade.platform}', '${trade.tradeSide}', '${trade.executedAt}', ${trade.profitLoss || 'NULL'}, '${trade.notes}, '${new Date().toISOString()}')') ` 
  ).join(', ');

  const query = dsql`
    WITH updates(id, ticker, region, currency, price, fees, volume, platform, tradeside, executedAt, profitLoss, notes, updatedAt) AS (
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
      tradeside = u.tradeSide::"tradeSide",
      "executedAt" = u.executedAt::TIMESTAMP,
      "profitLoss" = u.profitLoss::numeric,
      notes = u.notes
      "updatedAt = u.updatedAt::TIMESTAMP
    FROM updates AS u
    WHERE th.id = u.id;
  `;

  return await db.execute(query);
}

export const deleteTradeHistory = async (id: number) => {
  return await db.transaction(async (tx) => {
    const [deletedTrade] = await tx.delete(schema.tradeHistory).where(eq(schema.tradeHistory.id, id)).returning();

    const existingPosition = await tx.query.positions.findFirst({
      where: and(
          eq(schema.positions.ticker, deletedTrade.ticker),
          eq(schema.positions.platform, deletedTrade.platform as any),
          eq(schema.positions.region, deletedTrade.region as any)
      ),
    });

    if (existingPosition) {
      let updatedVolume = existingPosition.volume;
      let updatedTotalCost = Number(existingPosition.totalCost);
      let updatedRealizedProfitLoss = Number(existingPosition.realizedProfitLoss);

      if (deletedTrade.tradeSide === 'BUY') {
        updatedVolume -= deletedTrade.volume;
        updatedTotalCost -= Number(deletedTrade.totalCost);
      } else {
        updatedVolume += deletedTrade.volume;
        updatedTotalCost += Number(deletedTrade.totalCost);
      }
      updatedRealizedProfitLoss -= (Number(deletedTrade.price) - Number(existingPosition.averagePrice)) * deletedTrade.volume - Number(deletedTrade.fees);

      const updatedAveragePrice = updatedVolume > 0 ? updatedTotalCost / updatedVolume : 0;

      if (updatedVolume !== 0 && existingPosition.closed) {
        await tx.update(schema.positions)
          .set({
              volume: updatedVolume,
              totalCost: String(updatedTotalCost),
              averagePrice: String(updatedAveragePrice),
              lastUpdatedAt: new Date(),
              realizedProfitLoss: String(updatedRealizedProfitLoss),
              closed: false,
              closedAt: null,
          })
          .where(eq(schema.positions.id, existingPosition.id));
      } else if (updatedVolume === 0) {
        await tx.delete(schema.positions)
          .where(eq(schema.positions.id, existingPosition.id));
      } else {
        await tx.update(schema.positions)
          .set({
              volume: updatedVolume,
              totalCost: String(updatedTotalCost),
              averagePrice: String(updatedAveragePrice),
              lastUpdatedAt: new Date(),
              realizedProfitLoss: String(updatedRealizedProfitLoss),
          })
          .where(eq(schema.positions.id, existingPosition.id));
      }
    }
    return deletedTrade;
  }) 
}

export const deleteTradeHistoryBatch = async (ids: number[]) => {
  return await db.transaction(async (tx) => {
    const deletedTrades = await tx.delete(schema.tradeHistory)
      .where(inArray(schema.tradeHistory.id, ids))
      .returning();

    const tradeGroups = deletedTrades.reduce((acc, trade) => {
      const key = `${trade.ticker}-${trade.platform}-${trade.region}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(trade);
      return acc;
    }, {} as Record<string, Trade[]>);

    for (const [key, trades] of Object.entries(tradeGroups)) {
      const [ticker, platform, region] = key.split('-');
      
      const existingPosition = await tx.query.positions.findFirst({
        where: and(
            eq(schema.positions.ticker, ticker),
            eq(schema.positions.platform, platform as any),
            eq(schema.positions.region, region as any)
        ),
      });

      if (existingPosition) {
        let updatedVolume = existingPosition.volume;
        let updatedTotalCost = Number(existingPosition.totalCost);
        let updatedRealizedProfitLoss = Number(existingPosition.realizedProfitLoss);
        console.log("originalVolume", existingPosition.volume);
        console.log("originalTotalCost", existingPosition.totalCost);

        for (const trade of trades) {
          if (trade.tradeSide === 'BUY') {
            updatedVolume -= trade.volume;
            updatedTotalCost -= Number(trade.totalCost);
            console.log("updatedVolume", updatedVolume);
            console.log("updatedTotalCost", updatedTotalCost);
          } else {
            updatedVolume += trade.volume;
            updatedTotalCost += Number(trade.totalCost);
            console.log("updatedVolume", updatedVolume);
            console.log("updatedTotalCost", updatedTotalCost);
          }
          updatedRealizedProfitLoss -= (Number(trade.price) - Number(existingPosition.averagePrice)) * trade.volume - Number(trade.fees);
        }

        const updatedAveragePrice = updatedVolume > 0 ? updatedTotalCost / updatedVolume : 0;
        
        if (updatedVolume !== 0 && existingPosition.closed) {
          await tx.update(schema.positions)
            .set({
              volume: updatedVolume,
              totalCost: String(updatedTotalCost),
              averagePrice: String(updatedAveragePrice),
              lastUpdatedAt: new Date(),
              realizedProfitLoss: String(updatedRealizedProfitLoss),
              closed: false,
              closedAt: null,
            })
            .where(eq(schema.positions.id, existingPosition.id));
        } else if (updatedVolume === 0) {
          await tx.delete(schema.positions)
            .where(eq(schema.positions.id, existingPosition.id));
        } else {
          await tx.update(schema.positions)
            .set({
              volume: updatedVolume,
              totalCost: String(updatedTotalCost),
              averagePrice: String(updatedAveragePrice),
              lastUpdatedAt: new Date(),
              realizedProfitLoss: String(updatedRealizedProfitLoss),
            })
            .where(eq(schema.positions.id, existingPosition.id)); 
        }
      }
    }

    return deletedTrades;
  });
};

export const getClosedPositions = async (startDate: Date, endDate: Date) => {
  return await db.query.positions.findMany({
    where: and(
      eq(schema.positions.closed, true),
      gte(schema.positions.closedAt, startDate),
      lte(schema.positions.closedAt, endDate)
    )
  });
};

export const getPositionPerformance = async (positionId: number) => {
  const position = await db.query.positions.findFirst({
    where: eq(schema.positions.id, positionId)
  });

  if (position && position.closed && position.closedAt) {
    const duration = position.closedAt.getTime() - position.openedAt.getTime();
    const durationDays = duration / (1000 * 60 * 60 * 24);
    const profitLoss = Number(position.realizedProfitLoss);
    const roi = (profitLoss / Number(position.totalCost)) * 100;

    return {
      duration: durationDays,
      profitLoss,
      roi
    };
  }

  return null;
};
