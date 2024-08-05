import type { Currency, Platform, Region, Trade, TradeSide } from '$lib/types/tradeTypes';
import { deleteTradeHistory, deleteTradeHistoryBatch, getAllTradeHistory, insertTradeHistory, updateTradeHistoryBatch } from '../../server/db/database';
import { reviver } from '$lib/helpers/JsonHelpers';

export async function load() {
    const trades = await getAllTradeHistory()

    return {
        trades
    }
}

export const actions = {
    addTrade: async ({ request}) => {
        const formData = await request.formData();
        const newTrade = {
            ticker: (formData.get('ticker') as string).toUpperCase(),
            region: formData.get('region') as Region,
            currency: formData.get('currency') as Currency,
            price: formData.get('price') as string,
            fees: formData.get('fees') as string,
            volume: parseFloat(formData.get('volume') as string),
            platform: formData.get('platform') as Platform,
            side: formData.get('side') as TradeSide,
            executedAt: new Date(formData.get('executedAt') as string),
            notes: formData.get('notes') as string,
            profitLoss: formData.get('profitLoss') as string,
            totalValue: ""
        };
        newTrade.totalValue = (parseFloat(newTrade.price) * newTrade.volume + parseFloat(newTrade.fees)).toString(); 
        await insertTradeHistory(newTrade);
    },
    updateTradeBatch: async ({ request }) => {
        const formData = await request.formData();
        const trades = formData.get('trades') as string;
        const updatedTrades = JSON.parse(trades, reviver) as Map<number, Trade>;
        const tradeList: Trade[] =[]
        for (let trade of updatedTrades.values()) {
            tradeList.push(trade)
        }
        await updateTradeHistoryBatch(tradeList);
    },
    deleteTrade: async ({ request }) => {
        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string);
        await deleteTradeHistory(id);
    },
    deleteTradesBatch: async ({ request }) => {
        const formData = await request.formData();
        const stringIds = formData.getAll('id') as string[];
        const ids = stringIds.map((id) => parseInt(id));
        await deleteTradeHistoryBatch(ids);
    },
}   