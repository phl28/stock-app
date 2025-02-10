import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { getArticle } from '@/server/db/database';

export const load: PageServerLoad = async ({ params }) => {
	const articleId = parseInt(params.articleId);
	if (isNaN(articleId)) {
		throw error(400, 'Invalid article ID');
	}
	const article = await getArticle(articleId);
	return {
		article: article[0]
	};
};
