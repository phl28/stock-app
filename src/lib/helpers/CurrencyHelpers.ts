export const formatCurrency = (value: string | null, currency: string) => {
	if (!value) return '';
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency
	});

	return formatter.format(Number(value));
};
