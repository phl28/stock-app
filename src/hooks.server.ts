import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { CLERK_SECRET_KEY } from '$env/static/private';

import { handleClerk } from 'clerk-sveltekit/server';

export const handle: Handle = sequence(
	handleClerk(CLERK_SECRET_KEY, {
		debug: true,
		protectedPaths: ['/trade', '/position'],
		signInUrl: '/sign-in'
	})
);
