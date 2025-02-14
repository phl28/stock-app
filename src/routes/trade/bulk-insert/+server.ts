import type { RequestHandler } from '@sveltejs/kit';

import { insertTradeHistory } from '@/server/db/database';
import type { Trade } from '@/lib/types';
import { assertHasSession } from '@/lib/types/utils';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		assertHasSession(locals);
		const requestBody = await request.json();
		const trades = requestBody.trades;
		let insertedTrades: Trade[] = [];
		for (const trade of trades) {
			const newTrade: Trade = {
				...trade,
				price: trade.price.replace(/,/g, ''),
				fees: trade.fees.replace(/,/g, ''),
				executedAt: new Date(trade.executedAt),
				volume: Number(trade.volume),
				positionId: Number(trade.positionId),
				createdBy: locals.session.userId
			};
			const insertedTrade = await insertTradeHistory(newTrade);
			insertedTrades = [...insertedTrades, insertedTrade];
		}
		return new Response(
			JSON.stringify({
				success: 1,
				trades: insertedTrades
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
};
