import type { RequestHandler } from './$types';
import { error, isHttpError } from '@sveltejs/kit';

import { assertHasSession, type AppLocals } from '@/lib/types/utils';
import { getTradeHistoryByTimePeriod } from '@/server/db/database';

export const GET: RequestHandler = async ({ url, locals }: { url: URL; locals: AppLocals }) => {
	try {
		assertHasSession(locals);
		const urlStartDateParam = url.searchParams.get('startDate') ?? '';
		const startDate =
			new Date(urlStartDateParam) ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1);
		const urlEndDateParam = url.searchParams.get('endDate') ?? '';
		const endDate = new Date(urlEndDateParam) ?? new Date();
		const trades = await getTradeHistoryByTimePeriod({
			userId: locals.session.userId,
			startDate: startDate,
			endDate: endDate
		});
		return new Response(JSON.stringify({ trades }), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (e) {
		if (e instanceof Error) {
			throw error(400, e.message);
		} else if (isHttpError(e)) {
			throw error(e.status, e.body.message);
		}
		throw error(500, 'An unexpected error occurred');
	}
};
