import type { HandleClientError } from '@sveltejs/kit';
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';

import { initializeClerkClient } from 'clerk-sveltekit/client';

initializeClerkClient(PUBLIC_CLERK_PUBLISHABLE_KEY, {
	afterSignInUrl: '/trade/1',
	signInUrl: '/sign-in'
});

export const handleError: HandleClientError = async ({ error, event }) => {
	console.error(error, event);
};
