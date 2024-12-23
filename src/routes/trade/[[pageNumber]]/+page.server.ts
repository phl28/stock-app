import type { Currency, Platform, Region, Trade, TradeSide } from '$lib/types/tradeTypes';
import {
	deleteTradeHistory,
	deleteTradeHistoryBatch,
	getLastTradeHistory,
	getActivePositions,
	insertTradeHistory,
	updateTradeHistoryBatch,
	getPaginatedTradeHistory,
	updatePositionNotes
} from '@/server/db/database';
import { reviver } from '@/lib/helpers/JsonHelpers.js';
import { PRIVATE_POLYGON_IO_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL, PUBLIC_SERVER_URL } from '$env/static/public';
import { error, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import type { FutuResponse } from '$lib/types/serverTypes';
import { dev } from '$app/environment';

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

export const load: PageServerLoad = async ({ params }) => {
	try {
		const pageNumber = isNaN(Number(params.pageNumber)) ? 1 : Number(params.pageNumber);
		const { trades, currentPage, totalPages, totalTrades } =
			await getPaginatedTradeHistory(pageNumber);
		const positions = await getActivePositions();
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
	syncTrades: async () => {
		const lastTrade = await getLastTradeHistory('FUTU');
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
				executedAt: new Date(trade.executedAt)
			};
			await insertTradeHistory(insertTrade);
		}
		return;
	},
	addTrade: async ({ request }) => {
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
			profitLoss: formData.get('profitLoss') as string,
			totalCost: ''
		};
		const isTickerValid = await checkTickerValid(newTrade.ticker);
		if (!isTickerValid) {
			return error(400, { message: 'Ticker is not valid' });
		}
		if (newTrade.price === '') {
			return error(400, { message: 'Price cannot be empty' });
		}
		newTrade.totalCost = (
			parseFloat(newTrade.price) * newTrade.volume +
			parseFloat(newTrade.fees)
		).toString();
		await insertTradeHistory(newTrade);
		return;
	},
	updateTradeBatch: async ({ request }) => {
		const formData = await request.formData();
		const trades = formData.get('trades') as string;
		const updatedTrades = JSON.parse(trades, reviver) as Map<number, Trade>;
		const tradeList: Trade[] = [];
		for (let trade of updatedTrades.values()) {
			tradeList.push(trade);
		}
		await updateTradeHistoryBatch(tradeList);
		return;
	},
	updatePositionBatch: async ({ request }) => {
		const formData = await request.formData();
		const positions = formData.get('positions') as string;
		const updatedPositions = JSON.parse(positions, reviver) as Map<number, string>;
		const positionsList: { id: number; notes: string }[] = [];
		for (let id of updatedPositions.keys()) {
			positionsList.push({ id: id, notes: updatedPositions.get(id) ?? '' });
		}
		await updatePositionNotes(positionsList);
		return;
	},
	deleteTrade: async ({ request }) => {
		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);
		await deleteTradeHistory(id);
		return;
	},
	deleteTradesBatch: async ({ request }) => {
		const formData = await request.formData();
		const stringIds = formData.getAll('id') as string[];
		const ids = stringIds.map((id) => parseInt(id));
		await deleteTradeHistoryBatch(ids);
		return;
	}
};
