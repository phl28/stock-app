import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch('/trade/calendar');
	const data = await response.json();
	return data;
};
