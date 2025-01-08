import type { Currency, Platform, Region, Trade, TradeSide } from '$lib/types/tradeTypes';
import {
	deleteTradeHistory,
	deleteTradeHistoryBatch,
	getLastTradeHistory,
	getActivePositions,
	insertTradeHistory,
	updateTradeHistoryBatch,
	getPaginatedTradeHistory,
	assignTradesToPosition
} from '@/server/db/database';
import { reviver } from '@/lib/helpers/JsonHelpers.js';
import { PRIVATE_POLYGON_IO_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL, PUBLIC_SERVER_URL } from '$env/static/public';
import { error, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import type { FutuResponse } from '$lib/types/serverTypes';
import { dev } from '$app/environment';
import { assertHasSession } from '@/lib/types/utils.js';

const checkTickerValid = async (ticker: string) => {
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
		const positions = await getActivePositions({ userId: locals.session.userId });
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
	addTrade: async ({ request, locals }) => {
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
		const isTickerValid = await checkTickerValid(newTrade.ticker);
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
		const updatedTrades = JSON.parse(trades, reviver) as Map<number, Trade>;
		const tradeList: Trade[] = [];
		for (let trade of updatedTrades.values()) {
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
			const ticker = (formData.get('ticker') as string).toUpperCase();
			const region = formData.get('region') as Region;
			const currency = formData.get('currency') as Currency;
			const platform = formData.get('platform') as Platform;
			const numOfTrades = Number(formData.get('numOfTrades') as string);
			const averageEntryPrice = formData.get('averageEntryPrice') as string;
			const averageExitPrice = formData.get('averageExitPrice') as string;
			const totalFees = formData.get('fees') as string;
			const totalVolume = Number(formData.get('totalVolume') as string);
			const outstandingVolume = Number(formData.get('outstandingVolume') as string);
			const grossProfitLoss = formData.get('grossProfitLoss') as string === '' ? null : formData.get('grossProfitLoss') as string;
			const side = formData.get('side') as string;
			const openedAt = new Date(formData.get('openedAt') as string);
			const closedAt = formData.get('closedAt') as string === '' ? null : new Date(formData.get('closedAt') as string);
			const insertPosition = {
				ticker,
				region,
				currency,
				totalVolume,
				outstandingVolume,
				averageEntryPrice,
				averageExitPrice,
				profitTargetPrice: null,
				stopLossPrice: null,
				grossProfitLoss,
				totalFees,
				isShort: side === 'SHORT',
				platform,
				numOfTrades,
				notes: '',
				openedAt,
				closedAt,
				reviewedAt: null,
				lastUpdatedAt: new Date(),
				createdBy: locals.session.userId,
				journal: null
			};
			await assignTradesToPosition({position: insertPosition, tradeIds})
		} else {
			await assignTradesToPosition({positionId: Number(positionId), tradeIds});
		}
		return;
	}
};
