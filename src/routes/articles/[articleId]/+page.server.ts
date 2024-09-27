import { getArticle } from "../../../server/db/database.js";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ params }) => {
    try {
        const article = await getArticle(Number(params.articleId));
        return {
            article
        }
    } catch (err) {
        return {
            article: null
        }
    }
}