import { deleteArticle } from '@/server/db/database';
import type { RequestHandler } from './$types';
import { del } from '@vercel/blob';
import type { OutputData } from '@editorjs/editorjs';

export const DELETE: RequestHandler = async ({ params, request }) => {
	try {
		const articleId = params.articleId;
		if (isNaN(Number(articleId))) {
			throw new Error('Invalid article ID');
		}
		const requestBody = (await request.json()) as OutputData;	
		const imageBlocks = requestBody?.blocks.filter((block) => block.type === 'image');
		if (imageBlocks) {
			for (const imageBlock of imageBlocks) {
				const imageUrl = imageBlock.data.file.url;
				await del(imageUrl);
			}
		}
		await deleteArticle(Number(articleId));
		return new Response(
			JSON.stringify({
				success: 1
			})
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: 0,
				error: error
			})
		);
	}
};
