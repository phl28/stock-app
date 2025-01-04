import { error, redirect, type Actions } from '@sveltejs/kit';
import { addArticle, getPaginatedArticles, searchArticles } from '@/server/db/database';
import type { PageServerLoad } from './$types.js';
import { assertHasSession } from '@/lib/types/utils.js';

type ArticleData = {
	createdAt: Date;
	updatedAt: Date | null;
	publishedAt: Date | null;
	title: string;
	content: unknown;
	articleId: number;
};
type ArticlesResponse = {
	articles: ArticleData[];
	currentPage: number;
	totalPages: number;
	totalArticles: number;
};

type SearchArticlesResponse = {
	articles: ArticleData[];
};

export const load: PageServerLoad = async ({ params, locals }) => {
	let userId: string | null = null;
	try {
		assertHasSession(locals);
		userId = locals.session.userId;
	} catch (err) {
		console.error('User is not logged in');
	}
	try {
		let publishedOnly = true;
		if (userId) {
			publishedOnly = false;
		}
		const pageNumber = Number(params.pageNumber) ?? 1;
		const result = await getPaginatedArticles(9, pageNumber, publishedOnly);
		return result satisfies ArticlesResponse;
	} catch (err) {
		error(404, 'Articles not found');
	}
};

export const actions = {
	createArticle: async ({ locals }) => {
		assertHasSession(locals);
		const article = {
			title: new Date().toLocaleDateString(),
			createdBy: locals.session.userId
		};
		let articleId: number;
		try {
			const { articleId: newArticleId } = await addArticle(article);
			articleId = newArticleId;
		} catch (err) {
			throw error(400, 'Article could not be created');
		}
		throw redirect(303, `/articles/${articleId}/edit`);
	},
	searchArticles: async ({ request }) => {
		const searchTerm = (await request.formData()).get('searchTerm') as string;
		const result = await searchArticles(searchTerm);
		return result satisfies SearchArticlesResponse;
	}
} satisfies Actions;
