import { updatePositionTradesBatch } from '@/server/db/database';
import type { RequestHandler } from './$types';
import { assertHasSession } from '@/lib/types/utils';
import { error, isHttpError } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		assertHasSession(locals);
		const requestBody = await request.json();
		await updatePositionTradesBatch({
			positionId: Number(requestBody.positionId),
			trades: requestBody.trades,
			userId: locals.session.userId
		});
		return new Response('success');
	} catch (e) {
		if (e instanceof Error) {
			throw error(400, e.message);
		} else if (isHttpError(e)) {
			throw error(e.status, e.body.message);
		}
		throw error(500, 'An unexpected error occurred');
	}
};
