import { error, redirect } from "@sveltejs/kit";
import { addArticle, getArticles } from "../../server/db/database";
import type { PageServerLoad } from "./$types";

type ArticleData = {
    createdAt: Date;
    updatedAt: Date | null;
    title: string;
    content: unknown;
}
type ArticlesResponse = {
    articles: ArticleData[];
    currentPage: number;
    totalPages: number;
    totalArticles: number;
}

export const load: PageServerLoad = async() => {
    try {
        const result = await getArticles(9);
        return result satisfies ArticlesResponse;
    } catch (err) {
        error(404, "Articles not found");
    }
}

export const actions = {
    createArticle: async () => {
        const article = {
            title: ""
        };
        let articleId: number;
        try {
            const { articleId: newArticleId } = await addArticle(article);
            articleId = newArticleId;
        }
        catch(err) {
            throw error(400, "Article could not be created");
        };
        throw redirect(303, `/articles/new/${articleId}`);
    },
}