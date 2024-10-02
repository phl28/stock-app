import type { RequestHandler } from './$types';
import { put, BlobAccessError } from '@vercel/blob';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = await request.json();
		const image = await fetch(url);
		const fileName = `uploaded-image-${Date.now()}`;
		const imageBlob = await image.blob();
		const blob = await put(fileName, imageBlob.stream(), {
			contentType: imageBlob.type,
			access: 'public'
		});
		return new Response(
			JSON.stringify({
				success: 1,
				file: {
					url: blob.url,
					name: blob.pathname
				}
			})
		);
	} catch (error) {
		if (error instanceof BlobAccessError) {
			return new Response(
				JSON.stringify({
					success: 0,
					error: "You don't have access to the blob"
				})
			);
		}
		console.error(error);
		return new Response(
			JSON.stringify({
				success: 0,
				error: (error as Error).message
			})
		);
	}
};
