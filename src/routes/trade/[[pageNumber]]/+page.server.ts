import { dev } from '$app/environment';
import { PRIVATE_POLYGON_IO_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL, PUBLIC_SERVER_URL } from '$env/static/public';
import { error, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

import type { Currency, Platform, Region, Trade, TradeSide } from '$lib/types/tradeTypes';
import type { FutuResponse } from '$lib/types';
import { reviver } from '@/lib/helpers/JsonHelpers.js';
import { assertHasSession } from '@/lib/types/utils.js';
import {
	deleteTradeHistory,
	deleteTradeHistoryBatch,
	getLastTradeHistory,
	getPositions,
	insertTradeHistory,
	updateTradeHistoryBatch,
	getPaginatedTradeHistory,
	assignTradesToPosition
} from '@/server/db/database';

const checkTickerValid = async (fetch: typeof globalThis.fetch, ticker: string) => {
	if (ticker.at(0) === '(' && ticker.at(-1) === ')') {
		// this indicates the ticker is wrapped in a bracket and it is delisted.
		return true;
	}
	const res = await fetch(
		`${PUBLIC_POLYGON_IO_URL}/v3/reference/tickers?ticker=${ticker}&apiKey=${PRIVATE_POLYGON_IO_API_KEY}`
	);
	if (res.ok) {
		const data = await res.json();
		return data.results.length > 0;
	}
	return false;
};

const fetchFutuTrades = async (startDate?: Date, endDate?: Date) => {
	const parsedStartDate = startDate?.toISOString().split('T')[0];
	const parsedEndDate = endDate?.toISOString().split('T')[0];
	const url = `${dev ? PUBLIC_SERVER_URL : '/api'}/sync-futu-trades${parsedStartDate ? `?start_date=${parsedStartDate}` : ''}${parsedEndDate && parsedEndDate !== parsedStartDate ? `&end_date=${parsedEndDate}` : ''}`;
	try {
		const res = await fetch(url);
		if (res.ok) {
			const data = await res.json();
			return data;
		}
	} catch (err) {
		console.error('Error fetching trades from server', err);
	}
};

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		assertHasSession(locals);
		const pageNumber = isNaN(Number(params.pageNumber)) ? 1 : Number(params.pageNumber);
		const { trades, currentPage, totalPages, totalTrades } = await getPaginatedTradeHistory({
			pageNumber,
			userId: locals.session.userId
		});
		const positions = await getPositions({ userId: locals.session.userId });
		return {
			trades,
			positions,
			currentPage,
			totalPages,
			totalTrades
		};
	} catch (err) {
		if (isHttpError(err)) {
			throw error(err.status, err.body.message);
		}
		throw error(500, 'An unexpected error occurred');
	}
};

export const actions = {
	syncTrades: async ({ locals }) => {
		assertHasSession(locals);
		const lastTrade = await getLastTradeHistory({
			userId: locals.session.userId,
			platform: 'FUTU'
		});
		let futuTrades: FutuResponse;
		if (lastTrade) {
			futuTrades = await fetchFutuTrades(lastTrade.executedAt, new Date());
		} else {
			futuTrades = await fetchFutuTrades();
		}
		if (futuTrades.error) {
			throw error(400, futuTrades.error);
		}
		for (const trade of futuTrades.trades) {
			const insertTrade = {
				...trade,
				createdBy: locals.session.userId,
				executedAt: new Date(trade.executedAt)
			};
			await insertTradeHistory(insertTrade);
		}
		return;
	},
	addTrade: async ({ fetch, request, locals }) => {
		assertHasSession(locals);
		const formData = await request.formData();
		const newTrade = {
			ticker: (formData.get('ticker') as string).toUpperCase(),
			region: formData.get('region') as Region,
			currency: formData.get('currency') as Currency,
			price: formData.get('price') as string,
			fees: (formData.get('fees') as string) === '' ? '0' : (formData.get('fees') as string),
			volume: parseFloat(formData.get('volume') as string),
			platform: formData.get('platform') as Platform,
			tradeSide: formData.get('side') as TradeSide,
			executedAt: new Date(formData.get('executedAt') as string),
			createdBy: locals.session.userId
		};
		const isTickerValid = await checkTickerValid(fetch, newTrade.ticker);
		if (!isTickerValid) {
			return error(400, { message: 'Ticker is not valid' });
		}
		if (newTrade.price === '') {
			return error(400, { message: 'Price cannot be empty' });
		}
		await insertTradeHistory(newTrade);
		return;
	},
	updateTradeBatch: async ({ request, locals }) => {
		assertHasSession(locals);
		const formData = await request.formData();
		const trades = formData.get('trades') as string;
		const updatedTrades = JSON.parse(trades) as Trade[];
		const tradeList: Trade[] = [];
		for (let trade of updatedTrades) {
			tradeList.push({ ...trade, createdBy: locals.session.userId });
		}
		await updateTradeHistoryBatch(tradeList);
		return;
	},
	deleteTrade: async ({ request, locals }) => {
		assertHasSession(locals);
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);
		await deleteTradeHistory({ userId: locals.session.userId, id });
		return;
	},
	deleteTradesBatch: async ({ request, locals }) => {
		assertHasSession(locals);
		const formData = await request.formData();
		const stringIds = formData.getAll('id') as string[];
		const ids = stringIds.map((id) => parseInt(id));
		await deleteTradeHistoryBatch({ userId: locals.session.userId, ids });
		return;
	},
	assignTradesToPosition: async ({ request, locals }) => {
		assertHasSession(locals);
		const formData = await request.formData();
		const positionId = formData.get('positionId') as string;
		const tradeIds = JSON.parse(formData.get('tradeIds') as string);
		if (positionId === 'newPosition') {
			await assignTradesToPosition({ tradeIds, userId: locals.session.userId });
		} else {
			await assignTradesToPosition({
				positionId: Number(positionId),
				tradeIds,
				userId: locals.session.userId
			});
		}
		return;
	}
};
