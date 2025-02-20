import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	console.log('locals', locals);
	const response = await fetch('/trade/calendar');
	const data = await response.json();
	return data;
};
