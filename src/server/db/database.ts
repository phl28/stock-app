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
      const isClosingTrade = (existingPosition.isShort && trade.tradeSide === 'BUY') || 
        (!existingPosition.isShort && trade.tradeSide === 'SELL');

      if (isClosingTrade) {
        const closingVolume = Math.min(Math.abs(existingPosition.volume), trade.volume);
        const remainingVolume = Math.abs(existingPosition.volume) - closingVolume;
        
        if (existingPosition.isShort) {
          realizedProfitLoss = Number(existingPosition.realizedProfitLoss) + 
            (Number(existingPosition.averagePrice) - Number(trade.price)) * closingVolume - Number(trade.fees);
        } else {
          realizedProfitLoss = Number(existingPosition.realizedProfitLoss) + 
            (Number(trade.price) - Number(existingPosition.averagePrice)) * closingVolume - Number(trade.fees);
        }

        updatedVolume = remainingVolume * (existingPosition.isShort ? -1 : 1);
        updatedTotalCost = Number(existingPosition.totalCost) - Number(trade.totalCost);
        updatedAveragePrice = remainingVolume > 0 ? updatedTotalCost / remainingVolume : 0;


        if (trade.volume > Math.abs(existingPosition.volume)) {
          const flippedVolume = trade.volume - Math.abs(existingPosition.volume);
          updatedVolume = flippedVolume * (existingPosition.isShort ? 1 : -1);
          updatedTotalCost = Number(trade.price) * flippedVolume;
          updatedAveragePrice = Number(trade.price);
        }
      } else {
        if (existingPosition.isShort) {
          updatedVolume = existingPosition.volume - trade.volume;
        } else {
          updatedVolume = existingPosition.volume + trade.volume;
        }
        updatedTotalCost = Number(existingPosition.totalCost) + Number(trade.totalCost);
        updatedAveragePrice = Math.abs(updatedTotalCost / updatedVolume);
        realizedProfitLoss = Number(existingPosition.realizedProfitLoss);
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
            isShort: false,
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
            isShort: updatedVolume < 0,
          })
          .where(eq(schema.positions.id, existingPosition.id));
        }
    } else {
      const newPosition: Position = {
        ticker: trade.ticker,
        region: trade.region,
        volume: trade.tradeSide === 'SELL' ? -trade.volume : trade.volume,
        averagePrice: trade.price,
        totalCost: trade.totalCost,
        openedAt: trade.executedAt,
        lastUpdatedAt: new Date(),
        platform: trade.platform,
        notes: '',
        realizedProfitLoss: '0',
        isShort: trade.tradeSide === 'SELL',
      };

      await tx.insert(schema.positions).values(newPosition);
    }

    return insertedTrade;
  });
};

export const updateTradeHistoryBatch = async (trades: Trade[]) => {
  const values = trades.map(trade => 
    dsql`(${trade.id}, ${trade.notes}, ${new Date().toISOString()}::TIMESTAMP)`
  );

  const query = dsql`
    WITH updates(id, notes, updatedAt) AS (
      VALUES ${dsql.join(values, ',')}
    )
    UPDATE ${schema.tradeHistory} AS th
    SET
      notes = u.notes,
      "updatedAt" = u.updatedAt
    FROM updates AS u
    WHERE th.id = u.id::INTEGER
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
      let updatedIsShort = existingPosition.isShort;

      const isClosingTrade = (existingPosition.isShort && deletedTrade.tradeSide === 'BUY') || 
       (!existingPosition.isShort && deletedTrade.tradeSide === 'SELL');

      if (isClosingTrade) {
        updatedTotalCost += Number(deletedTrade.price) * deletedTrade.volume;
        let averagePrice: number; 
        if (existingPosition.isShort) {
          updatedVolume -= deletedTrade.volume;
          averagePrice = Math.abs(updatedTotalCost / updatedVolume);
          updatedRealizedProfitLoss -= (Number(averagePrice) - Number(deletedTrade.price)) * deletedTrade.volume;
        } else {
          updatedVolume += deletedTrade.volume;
          averagePrice = Math.abs(updatedTotalCost / updatedVolume);
          updatedRealizedProfitLoss -= (Number(deletedTrade.price) - Number(averagePrice)) * deletedTrade.volume;
        }
        updatedRealizedProfitLoss += Number(deletedTrade.fees);
      } else {
        if (existingPosition.isShort) {
          updatedVolume += deletedTrade.volume;
        } else {
          updatedVolume -= deletedTrade.volume;
        }
        updatedTotalCost -= Number(deletedTrade.totalCost);
      }

      const updatedAveragePrice = updatedVolume !== 0 ? Math.abs(updatedTotalCost / updatedVolume) : 0;
      updatedIsShort = updatedVolume < 0;

      if (updatedVolume === 0) {
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
            isShort: updatedIsShort,
            closed: false,
            closedAt: null,
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
        let updatedIsShort = existingPosition.isShort;

        for (const trade of trades) {
          const isClosingTrade = (existingPosition.isShort && trade.tradeSide === 'BUY') || 
            (!existingPosition.isShort && trade.tradeSide === 'SELL');

          if (isClosingTrade) {
            updatedTotalCost += Number(trade.price) * trade.volume;
            let averagePrice: number; 
            if (existingPosition.isShort) {
              updatedVolume -= trade.volume;
              averagePrice = Math.abs(updatedTotalCost / updatedVolume);
              updatedRealizedProfitLoss -= (Number(averagePrice) - Number(trade.price)) * trade.volume;
            } else {
              updatedVolume += trade.volume;
              averagePrice = Math.abs(updatedTotalCost / updatedVolume);
              updatedRealizedProfitLoss -= (Number(trade.price) - Number(averagePrice)) * trade.volume;
            }
            updatedRealizedProfitLoss += Number(trade.fees);
          } else {
            if (existingPosition.isShort) {
              updatedVolume += trade.volume;
            } else {
              updatedVolume -= trade.volume;
            }
            updatedTotalCost -= Number(trade.totalCost);
          }
        }

        const updatedAveragePrice = updatedVolume !== 0 ? Math.abs(updatedTotalCost / updatedVolume) : 0;
        updatedIsShort = updatedVolume < 0;

        if (updatedVolume === 0) {
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
              isShort: updatedIsShort,
              closed: false,
              closedAt: null,
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
