import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { assertHasSession } from '@/lib/types/utils';
import { updatePositionJournal } from '@/server/db/database';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	assertHasSession(locals);
	const requestBody = await request.json();
	const positionId = params.positionId;
	if (isNaN(Number(positionId))) {
		throw error(400, 'Invalid position ID');
	}
	const position = {
		id: Number(positionId),
		journal: requestBody.journal
	};
	const updatedPosition = await updatePositionJournal({ userId: locals.session.userId, position });
	return new Response(JSON.stringify(updatedPosition));
};
