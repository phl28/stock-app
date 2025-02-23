import type { PageServerLoad, RouteParams } from './$types';
import { error, isHttpError } from '@sveltejs/kit';
import { PRIVATE_POLYGON_IO_API_KEY, PRIVATE_ALPHA_VANTAGE_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL, PUBLIC_ALPHA_VANTAGE_URL } from '$env/static/public';

import { assertHasSession, type AppLocals } from '@/lib/types/utils';
import type { StockData, VolumeData } from '@/lib/types/index.js';
import { convertUnixTimestampToDate } from '@/lib/helpers/DataHelpers.js';
import { deletePosition, getPosition, markPositionReviewed } from '@/server/db/database';

const ALPHA_VANTAGE_API_KEY = PRIVATE_ALPHA_VANTAGE_API_KEY;
const POLYGON_IO_API_KEY = PRIVATE_POLYGON_IO_API_KEY;

type AlphaVantageData = {
	'Time Series (Daily)': {
		[key: string]: {
			'1. open': string;
			'2. high': string;
			'3. low': string;
			'4. close': string;
			'5. volume': string;
		};
	};
};

const fetchStockData = async (
	fetch: typeof globalThis.fetch,
	ticker: string,
	startDate: Date,
	endDate: Date
) => {
	const today = new Date();
	const twoYearsAgoToday = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

	const formattedLastExecutedDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
	const formattedTwoYearsPriorToLastExecutedDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;

	let stockData: StockData[] = [];
	let volumeData: Pick<VolumeData, 'time' | 'value'>[] = [];
	if (endDate < twoYearsAgoToday) {
		const res = await fetch(
			`${PUBLIC_ALPHA_VANTAGE_URL}/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`
		);
		const data = (await res.json()) as AlphaVantageData;
		for (const [date, item] of Object.entries(data['Time Series (Daily)'])) {
			stockData = [
				{
					time: date,
					open: Number(item['1. open']),
					high: Number(item['2. high']),
					low: Number(item['3. low']),
					close: Number(item['4. close'])
				},
				...stockData
			];
			volumeData = [
				{
					time: date,
					value: Number(item['5. volume'])
				},
				...volumeData
			];
		}
	} else {
		const res = await fetch(
			`${PUBLIC_POLYGON_IO_URL}/v2/aggs/ticker/${ticker}/range/1/day/${formattedTwoYearsPriorToLastExecutedDate}/${formattedLastExecutedDate}?adjusted=false&sort=asc&apiKey=${POLYGON_IO_API_KEY}`
		);
		const data = await res.json();
		for (const item of data.results) {
			const date = convertUnixTimestampToDate(item.t);
			stockData = [
				...stockData,
				{
					time: date,
					open: item.o,
					high: item.h,
					low: item.l,
					close: item.c
				}
			];
			volumeData = [
				...volumeData,
				{
					time: date,
					value: item.v
				}
			];
		}
	}

	return { stockData, volumeData };
};

export const load: PageServerLoad = async ({
	fetch,
	params,
	locals
}: {
	fetch: typeof globalThis.fetch;
	params: RouteParams;
	locals: AppLocals;
}) => {
	assertHasSession(locals);
	const positionId = Number(params.positionId);
	if (isNaN(positionId) || positionId < 0) {
		throw new Error('Invalid position ID');
	}
	try {
		const data = await getPosition({ positionId, userId: locals.session.userId });
		const { position, trades } = data ?? {};
		if (position && position.ticker && trades) {
			const lastExecutedDate = trades.at(-1)?.executedAt ?? new Date();
			const twoYearsAgo = new Date(
				lastExecutedDate.getFullYear() - 2,
				lastExecutedDate.getMonth(),
				lastExecutedDate.getDate()
			);

			const { stockData, volumeData } = await fetchStockData(
				fetch,
				position.ticker,
				twoYearsAgo,
				lastExecutedDate
			);
			if (stockData && volumeData) {
				return {
					position,
					trades,
					stockData,
					volumeData
				};
			}
			return {
				position,
				trades
			};
		}
	} catch (err) {
		if (isHttpError(err)) {
			throw error(err.status, err.body.message);
		}
		throw error(500, 'An unexpected error occurred');
	}
};

export const actions = {
	markPositionReviewed: async ({ locals, params }: { locals: AppLocals; params: RouteParams }) => {
		assertHasSession(locals);
		const positionId = Number(params.positionId);
		if (isNaN(positionId) || positionId < 0) {
			throw new Error('Invalid position ID');
		}
		try {
			const position = await markPositionReviewed({ positionId, userId: locals.session.userId });
			if (position) {
				return;
			}
		} catch (err) {
			if (isHttpError(err)) {
				throw error(err.status, err.body.message);
			}
			throw error(500, 'An unexpected error occurred');
		}
	},
	deletePosition: async ({ params, locals }: { params: RouteParams; locals: AppLocals }) => {
		assertHasSession(locals);
		const positionId = Number(params.positionId);
		if (isNaN(positionId) || positionId < 0) {
			throw new Error('Invalid position ID');
		}
		try {
			await deletePosition({ positionId, userId: locals.session.userId });
		} catch (err) {
			if (isHttpError(err)) {
				throw error(err.status, err.body.message);
			}
			throw error(500, 'An unexpected error occurred');
		}
	}
};
