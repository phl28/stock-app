import { assertHasSession } from "@/lib/types/utils";
import type { PageServerLoad } from "./$types";
import { getPosition, markPositionReviewed } from '@/server/db/database';
import { error, isHttpError } from "@sveltejs/kit";
import { PRIVATE_POLYGON_IO_API_KEY } from '$env/static/private';
import { PUBLIC_POLYGON_IO_URL } from '$env/static/public';

const API_KEY = PRIVATE_POLYGON_IO_API_KEY;

export const load: PageServerLoad = async ({ params, locals }) => {
    assertHasSession(locals);
    const positionId = Number(params.positionId);   
    if (isNaN(positionId) || positionId < 0) {
        throw new Error('Invalid position ID');
    }
    try {
        const position = await getPosition({ positionId, userId: locals.session.userId });
        if (position[0].ticker) {
            const lastExecutedDate = position.at(-1)?.tradeExecutedAt ?? new Date();
            let twoYearsAgo = new Date(lastExecutedDate.getFullYear() - 2, lastExecutedDate.getMonth(), lastExecutedDate.getDate());

            const formattedToday = `${lastExecutedDate.getFullYear()}-${String(lastExecutedDate.getMonth() + 1).padStart(2, '0')}-${String(lastExecutedDate.getDate()).padStart(2, '0')}`;
            const formattedTwoYearsAgo = `${twoYearsAgo.getFullYear()}-${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}-${String(twoYearsAgo.getDate()).padStart(2, '0')}`;
            const res = await fetch(
                `${PUBLIC_POLYGON_IO_URL}/v2/aggs/ticker/${position[0].ticker}/range/1/day/${formattedTwoYearsAgo}/${formattedToday}?adjusted=true&sort=asc&apiKey=${API_KEY}`
            );
            if (res.ok && res.status === 200) {
                const stockData = await res.json();
                return {
                    position,
                    stockData
                }
            }
        }
        return {
            position,
        }
    } catch (err) {
		if (isHttpError(err)) {
			throw error(err.status, err.body.message);
		}
		throw error(500, 'An unexpected error occurred');
	}
}

export const actions = {
    markPositionReviewed: async ({ locals, params }) => {
        assertHasSession(locals);
        const positionId = Number(params.positionId);
        if (isNaN(positionId) || positionId < 0) {
            throw new Error('Invalid position ID');
        }
        try {
            const position = await markPositionReviewed({ positionId, userId: locals.session.userId });
            if (position) {
                return;
            }
        } catch (err) {
            if (isHttpError(err)) {
                throw error(err.status, err.body.message);
            }
            throw error(500, 'An unexpected error occurred');
        }
    }
}