import { assertHasSession, type AppLocals } from '@/lib/types/utils';
import type { PageServerLoad } from './$types';

import { getTradeHistoryByTimePeriod } from '@/server/db/database';

export const load: PageServerLoad = async ({ locals }: { locals: AppLocals }) => {
	assertHasSession(locals);
	const monthStart = new Date();
	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);
	const trades = await getTradeHistoryByTimePeriod({
		userId: locals.session.userId,
		startDate: monthStart,
		endDate: new Date()
	});

	return { trades };
};
