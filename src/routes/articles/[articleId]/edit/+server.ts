import { error } from '@sveltejs/kit';
import { updateArticle } from '@/server/db/database';
import type { RequestHandler } from './$types';
import { assertHasSession } from '@/lib/types/utils';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	assertHasSession(locals);
	const requestBody = await request.json();
	const articleId = params.articleId;
	if (isNaN(Number(articleId))) {
		throw error(400, 'Invalid article ID');
	}
	const article = {
		articleId: Number(articleId),
		title: requestBody.title,
		content: requestBody.content,
		createdBy: locals.session.userId
	};
	const updatedArticle = await updateArticle(article, requestBody.publish);
	return new Response(JSON.stringify(updatedArticle));
};
