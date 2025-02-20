import type { ClerkJWTClaims } from '@clerk/types';

type Session = {
	userId: string;
	claims: { [key: string]: ClerkJWTClaims };
};

export type AppLocals = App.Locals & {
	session?: Session;
};

export const assertHasSession: (
	locals: AppLocals
) => asserts locals is AppLocals & { session: Session } = (locals: AppLocals) => {
	if (
		!locals.session ||
		typeof locals.session.userId !== 'string' ||
		typeof locals.session.claims !== 'object'
	) {
		throw new Error('Invalid session in locals');
	}
};
