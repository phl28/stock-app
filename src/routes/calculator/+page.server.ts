import { fail, type ActionFailure } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { PRIVATE_POLYGON_IO_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL } from '$env/static/public';
import type { ChartResponse, StockData, VolumeData } from '$lib/types/chartTypes';
import { convertUnixTimestampToDate } from '@/lib/helpers/DataHelpers';

const API_KEY = PRIVATE_POLYGON_IO_API_KEY;

export const load: PageServerLoad = async ({ fetch }) => {
	const today = new Date();
	const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

	const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
	const formattedTwoYearsAgo = `${twoYearsAgo.getFullYear()}-${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAgo.getDate()).padStart(2, '0')}`;

	try {
		const res = await fetch(
			`${PUBLIC_POLYGON_IO_URL}/v2/aggs/ticker/AAPL/range/1/day/${formattedTwoYearsAgo}/${formattedToday}?adjusted=true&sort=asc&apiKey=${API_KEY}`
		);
		if (res.ok) {
			const data = await res.json();
			let stockData: StockData[] = [];
			let volumeData: Pick<VolumeData, 'time' | 'value'>[] = [];
			for (const item of data.results) {
				const date = convertUnixTimestampToDate(item.t);
				stockData = [
					...stockData,
					{
						time: item.t,
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
			return { stockData, volumeData, error: null } as ChartResponse;
		} else {
			throw new Error('Error fetching stock data');
		}
	} catch (err) {
		console.error('Error fetching stock data', err);
		return { stockData: [], volumeData: [], error: null } as ChartResponse;
	}
};

export const actions: Actions = {
	fetchStockData: async ({
		request
	}: {
		request: Request;
	}): Promise<ChartResponse | ActionFailure<{ message: string }>> => {
		const formData = await request.formData();
		const ticker = formData.get('ticker')?.toString().toUpperCase();
		if (!ticker) {
			return fail(400, { message: 'Ticker is required' });
		}
		if (!PUBLIC_POLYGON_IO_URL || !API_KEY) {
			return fail(500, { message: 'An unexpected error occurred' });
		}

		const today = new Date();
		const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

		const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
		const formattedTwoYearsAgo = `${twoYearsAgo.getFullYear()}-${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAgo.getDate()).padStart(2, '0')}`;

		try {
			const res = await fetch(
				`${PUBLIC_POLYGON_IO_URL}/v2/aggs/ticker/${ticker}/range/1/day/${formattedTwoYearsAgo}/${formattedToday}?adjusted=true&sort=asc&apiKey=${API_KEY}`
			);
			if (res.ok && res.status === 200) {
				const data = await res.json();
				let stockData: StockData[] = [];
				let volumeData: Pick<VolumeData, 'time' | 'value'>[] = [];
				for (const item of data.results) {
					const date = convertUnixTimestampToDate(item.t);
					stockData = [
						...stockData,
						{
							time: item.t,
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
				return { stockData, volumeData, error: null } as ChartResponse;
			} else {
				return fail(res.status, { message: res.statusText });
			}
		} catch (err) {
			console.error('Error fetching stock data', err);
			if (err instanceof Error) {
				return fail(500, { message: err.message });
			}
			return fail(500, { message: 'An unexpected error occurred' });
		}
	}
};
