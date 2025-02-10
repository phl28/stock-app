import type { RequestHandler } from './$types';

import { del } from '@vercel/blob';

type DeleteImageRequest = {
	imageUrls: string[];
};

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const jsonRequest = (await request.json()) as DeleteImageRequest;
		const imageUrls = jsonRequest.imageUrls;
		for (const imageUrl of imageUrls) {
			await del(imageUrl);
		}
		return new Response(
			JSON.stringify({
				success: 1
			})
		);
	} catch (error) {
		console.error(error);
		return new Response(
			JSON.stringify({
				success: 0,
				error: (error as Error).message
			})
		);
	}
};
