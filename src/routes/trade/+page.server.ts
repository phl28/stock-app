import type { Currency, Platform, Region, Trade, TradeSide } from '$lib/types/tradeTypes';
import { deleteTradeHistory, deleteTradeHistoryBatch, getAllTradeHistory, getPositions, insertTradeHistory, updateTradeHistoryBatch } from '../../server/db/database';
import { reviver } from '$lib/helpers/JsonHelpers';
import { PRIVATE_POLYGON_IO_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL } from '$env/static/public';
import { error, fail, isHttpError } from '@sveltejs/kit';
import { TrdGetHistoryOrderList } from '../../server/futu/tradeHistory';

const checkTickerValid = async (ticker: string) => {
    const res = await fetch(`${PUBLIC_POLYGON_IO_URL}/v3/reference/tickers?ticker=${ticker}&apiKey=${PRIVATE_POLYGON_IO_API_KEY}`);
    if (res.ok) {
        const data = await res.json();
        return data.results.length > 0;
    }
    return false;
}

export async function load() {
    try {
    const trades = await getAllTradeHistory()
    const positions = await getPositions();
        return {
            trades,
            positions
        }
    }
    catch (err) {
        if (isHttpError(err)) {
            return error(err.status, { message: err.body.message });
        }
        return fail(500); 
    }
}

export const actions = {
    syncTrades: async () => {
        // @FIXME: This does not work somehow and the documentatino is not clear.
        // const result = await TrdGetHistoryOrderList();
        console.log("Do nothing at the moment");
      },
    addTrade: async ({ request}) => {
        const formData = await request.formData();
        const newTrade = {
            ticker: (formData.get('ticker') as string).toUpperCase(),
            region: formData.get('region') as Region,
            currency: formData.get('currency') as Currency,
            price: formData.get('price') as string,
            fees: formData.get('fees') as string === "" ? "0" : formData.get('fees') as string,
            volume: parseFloat(formData.get('volume') as string),
            platform: formData.get('platform') as Platform,
            tradeSide: formData.get('side') as TradeSide,
            executedAt: new Date(formData.get('executedAt') as string),
            profitLoss: formData.get('profitLoss') as string,
            totalCost: ""
        };
        const isTickerValid = await checkTickerValid(newTrade.ticker);
        if (!isTickerValid) {
            return error(400, {message: "Ticker is not valid"});
        }
        if (newTrade.price === "" ) {
            return error(400, { message: "Price cannot be empty" });
        }
        newTrade.totalCost = (parseFloat(newTrade.price) * newTrade.volume + parseFloat(newTrade.fees)).toString(); 
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