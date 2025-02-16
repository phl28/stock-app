import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { PRIVATE_POLYGON_IO_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL } from '$env/static/public';
import type { ChartResponse } from '$lib/types/chartTypes';

const API_KEY = PRIVATE_POLYGON_IO_API_KEY;

export const load: PageServerLoad = async ({ fetch }) => {
	const today = new Date();
	let twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

	const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
	const formattedTwoYearsAgo = `${twoYearsAgo.getFullYear()}-${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAgo.getDate()).padStart(2, '0')}`;

	try {
		const res = await fetch(
			`${PUBLIC_POLYGON_IO_URL}/v2/aggs/ticker/AAPL/range/1/day/${formattedTwoYearsAgo}/${formattedToday}?adjusted=true&sort=asc&apiKey=${API_KEY}`
		);
		if (res.ok) {
			const stockData = await res.json();
			return { stockData, smaData: [], error: null } as ChartResponse;
		} else {
			throw new Error('Error fetching stock data');
		}
	} catch (err) {
		console.error('Error fetching stock data', err);
		return { stockData: [], smaData: [], error: null } as ChartResponse;
	}
};

export const actions = {
	fetchStockData: async ({ request }) => {
		const formData = await request.formData();
		const ticker = formData.get('ticker')?.toString().toUpperCase();
		if (!ticker) {
			return fail(400, { message: 'Ticker is required' });
		}
		if (!PUBLIC_POLYGON_IO_URL || !API_KEY) {
			return fail(500, { message: 'An unexpected error occurred' });
		}

		const today = new Date();
		let twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

		const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
		const formattedTwoYearsAgo = `${twoYearsAgo.getFullYear()}-${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAgo.getDate()).padStart(2, '0')}`;

		try {
			const res = await fetch(
				`${PUBLIC_POLYGON_IO_URL}/v2/aggs/ticker/${ticker}/range/1/day/${formattedTwoYearsAgo}/${formattedToday}?adjusted=true&sort=asc&apiKey=${API_KEY}`
			);
			if (res.ok && res.status === 200) {
				const stockData = await res.json();
				return { stockData, smaData: [], error: null } as ChartResponse;
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
