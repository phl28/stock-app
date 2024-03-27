import { error } from '@sveltejs/kit';
import { PRIVATE_POLYGON_IO_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL } from '$env/static/public';

const API_KEY = PRIVATE_POLYGON_IO_API_KEY

export const load = async ({ url }) => {
    const ticker = url.searchParams.get('ticker');
    const today = new Date();
    let threemonthsago = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

    if (threemonthsago.getMonth() < 0) {
        const adjustedYear = threemonthsago.getFullYear() - 1;
        threemonthsago = new Date(adjustedYear, 12 + threemonthsago.getMonth(), threemonthsago.getDate());
    }
  
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const formattedThreeMonthsAgo = `${threemonthsago.getFullYear()}-${String(threemonthsago.getMonth() + 1).padStart(2, '0')}-${String(threemonthsago.getDate()).padStart(2, '0')}`;
    try {
        const res = await fetch(`${PUBLIC_POLYGON_IO_URL}/v2/aggs/ticker/${ticker}/range/1/day/${formattedThreeMonthsAgo}/${formattedToday}?adjusted=true&sort=asc&limit=120&apiKey=${API_KEY}`);
        if (res.ok) {
            const data = await res.json();
            return {
                results: data.results
            }
        }
    }
    catch (err) {
        return error(500, 'Error fetching stock data')
    }
};