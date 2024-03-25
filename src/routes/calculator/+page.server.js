import { error } from '@sveltejs/kit';
import { PRIVATE_ALPHA_VANTAGE_API_KEY } from '$env/static/private';
import { PUBLIC_ALPHA_VANTAGE_URL } from '$env/static/public';

const API_KEY = PRIVATE_ALPHA_VANTAGE_API_KEY

export const load = async ({ url }) => {
    const ticker = url.searchParams.get('ticker');
    try {
        const res = await fetch(`${PUBLIC_ALPHA_VANTAGE_URL}/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${API_KEY}`);
        if (res.ok) {
            const data = await res.json();
            return data['Time Series (Daily)'];
        }
    }
    catch (err) {
        return error(500, 'Error fetching stock data')
    }
};