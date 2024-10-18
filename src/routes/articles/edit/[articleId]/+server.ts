import { error } from '@sveltejs/kit';
import { updateArticle } from '@/server/db/database';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const requestBody = await request.json();
	const articleId = params.articleId;
	if (isNaN(Number(articleId))) {
		throw error(400, 'Invalid article ID');
	}
	const article = {
		articleId: Number(articleId),
		title: requestBody.title,
		content: requestBody.content
	};
	const updatedArticle = await updateArticle(article);
	return new Response(JSON.stringify(updatedArticle));
};
