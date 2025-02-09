export const load = async ({ url }) => {
	const redirectUrl = url.searchParams.get('redirectUrl');
	return {
		redirectUrl
	};
};
