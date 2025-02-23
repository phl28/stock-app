import { error } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types.js';

import { getArticle } from '@/server/db/database';
import type { AppLocals } from '@/lib/types/utils.js';

export const load: PageServerLoad = async ({
	params,
	locals
}: {
	params: RouteParams;
	locals: AppLocals;
}) => {
	try {
		const article = await getArticle(Number(params.articleId));
		return {
			article: article[0],
			user: locals.session?.userId
		};
	} catch {
		throw error(404, 'Article not found');
	}
};
