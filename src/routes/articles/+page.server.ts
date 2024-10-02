import { error, redirect, type Actions } from '@sveltejs/kit';
import { addArticle, getArticles, searchArticles } from '../../server/db/database';
import type { PageServerLoad } from './$types';

type ArticleData = {
	createdAt: Date;
	updatedAt: Date | null;
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

export const load: PageServerLoad = async () => {
	try {
		const result = await getArticles(9, 1);
		return result satisfies ArticlesResponse;
	} catch (err) {
		error(404, 'Articles not found');
	}
};

export const actions = {
	createArticle: async () => {
		const article = {
			title: new Date().toLocaleDateString()
		};
		let articleId: number;
		try {
			const { articleId: newArticleId } = await addArticle(article);
			articleId = newArticleId;
		} catch (err) {
			throw error(400, 'Article could not be created');
		}
		throw redirect(303, `/articles/edit/${articleId}`);
	},
	searchArticles: async ({ request }) => {
		const searchTerm = (await request.formData()).get('searchTerm') as string;
		const result = await searchArticles(searchTerm);
		console.log(result);
		return result satisfies SearchArticlesResponse;
	}
} satisfies Actions;
