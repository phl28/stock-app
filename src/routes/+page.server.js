import { json } from '@sveltejs/kit';
import { PRIVATE_POLYGON_IO_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL } from '$env/static/public';

const API_KEY = PRIVATE_POLYGON_IO_API_KEY

export const actions = {
    fetchStockData: async ({ request }) => {
      const formData = await request.formData();
      const ticker = formData.get('ticker')?.toString().toUpperCase();
  
      const today = new Date();
      let twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

      const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const formattedSixMonthsAgo = `${twoYearsAgo.getFullYear()}-${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAgo.getDate()).padStart(2, '0')}`;
  
      try {
        const res = await fetch(`${PUBLIC_POLYGON_IO_URL}/v2/aggs/ticker/${ticker}/range/1/day/${formattedSixMonthsAgo}/${formattedToday}?adjusted=true&sort=asc&apiKey=${API_KEY}`);
        if (res.ok) {
          const data = await res.json();
          return data;
        }
        else {
            return json(res);
        }
      } catch (err) {
        console.error('Error fetching stock data', err);
        return json({ error: 'Error fetching stock data' }, { status: 500 });
      }
    }
  };