import type { HandleClientError } from '@sveltejs/kit';
import { initializeClerkClient } from 'clerk-sveltekit/client';
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';

initializeClerkClient(PUBLIC_CLERK_PUBLISHABLE_KEY, {
	afterSignInUrl: '/trade/1',
	signInUrl: '/sign-in'
});

export const handleError: HandleClientError = async ({ error, event }) => {
	console.error(error, event);
};
