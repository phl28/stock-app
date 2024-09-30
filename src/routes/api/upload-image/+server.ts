import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { put } from "@vercel/blob";

export const POST: RequestHandler = async ({ request }) => {
    try {
      const form = await request.formData();
      const imageFile = form.get('image') as File;
      const blob = await put(imageFile.name, imageFile, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      return new Response(JSON.stringify(
        {
          success: 1,
          file: {
            url: blob.url,
            name: blob.pathname,
          }
        }
      ));
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify(
        {
          success: 0,
          error: (error as Error).message
        }
      ));
    }
};