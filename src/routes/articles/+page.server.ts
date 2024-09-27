import { fail, json } from "@sveltejs/kit";
import { getArticles } from "../../server/db/database";
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
        fail(500);
    }
}