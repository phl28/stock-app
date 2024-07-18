import { getAllTradeHistory } from '../../server/db/database';

export async function load() {
    const trades = await getAllTradeHistory()

    return {
        trades
    }
}