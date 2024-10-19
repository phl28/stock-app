import type { RequestHandler } from './$types'
import { insertTradeHistory } from '@/server/db/database';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const requestBody= await request.json();
        const trades = requestBody.trades;
        for (const trade of trades) {
            const newTrade = {
                ...trade,
                price: trade.price.replace(/,/g, ''),
                totalCost: trade.totalCost.replace(/,/g, ''),
                executedAt: new Date(trade.executedAt),
            }
            await insertTradeHistory(newTrade);
        }
        return new Response(
            JSON.stringify({
                success: 1
            })
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                success: 0,
                error: error
            })
        );
    }
}