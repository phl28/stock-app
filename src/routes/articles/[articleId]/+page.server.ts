import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

import { getArticle } from '@/server/db/database';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const article = await getArticle(Number(params.articleId));
		return {
			article: article[0]
		};
	} catch (err) {
		throw error(404, 'Article not found');
	}
};
