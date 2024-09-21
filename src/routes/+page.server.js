import { error } from '@sveltejs/kit';
import { PRIVATE_POLYGON_IO_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL } from '$env/static/public';

const API_KEY = PRIVATE_POLYGON_IO_API_KEY

export async function load() {
  const today = new Date();
  let twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

  const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const formattedTwoYearsAgo = `${twoYearsAgo.getFullYear()}-${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAgo.getDate()).padStart(2, '0')}`; 

  try {
    const res = await fetch(`${PUBLIC_POLYGON_IO_URL}/v2/aggs/ticker/AAPL/range/1/day/${formattedTwoYearsAgo}/${formattedToday}?adjusted=true&sort=asc&apiKey=${API_KEY}`);
    const res2 = await fetch(`${PUBLIC_POLYGON_IO_URL}/v1/indicators/sma/AAPL?timespan=day&adjusted=true&window=50&series_type=close&expand_underlying=true&order=desc&limit=5000&apiKey=${API_KEY}`);
    if (res.ok && res2.ok) {
      const stockData = await res.json();
      const smaData = await res2.json();
      return { stockData, smaData, error: null };
    }
    else {
      throw new Error('Error fetching stock data');
    }
  } catch (err) {
    console.error('Error fetching stock data', err);
    return {
      stockData: null,
      smaData: null,
      error: "Error fetching stock data"
    }
  }
}

export const actions = {
    fetchStockData: async ({ request }) => {
      const formData = await request.formData();
      const ticker = formData.get('ticker')?.toString().toUpperCase();
  
      const today = new Date();
      let twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

      const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const formattedTwoYearsAgo = `${twoYearsAgo.getFullYear()}-${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAgo.getDate()).padStart(2, '0')}`;
  
      try {
        const res = await fetch(`${PUBLIC_POLYGON_IO_URL}/v2/aggs/ticker/${ticker}/range/1/day/${formattedTwoYearsAgo}/${formattedToday}?adjusted=true&sort=asc&apiKey=${API_KEY}`);
        const res2 = await fetch(`${PUBLIC_POLYGON_IO_URL}/v1/indicators/sma/AAPL?timespan=day&adjusted=true&window=50&series_type=close&expand_underlying=true&order=desc&limit=5000&apiKey=${API_KEY}`);
        if (res.ok && res2.ok) {
          const stockData = await res.json();
          const smaData = await res2.json();
          return { stockData, smaData, error: null };
        }
        else {
          console.error('Error fetching stock data', res.status);
          return error(500, { message: 'Error fetching stock data' });
        }
      } catch (err) {
        console.error('Error fetching stock data', err);
        return {
          stockData: null,
          smaData: null,
          error: err,
        }
      }
    } 
  };