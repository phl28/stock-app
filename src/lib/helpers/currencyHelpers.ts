export const formatCurrency = (value: string, currency: string) => {
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency
	});

	return formatter.format(Number(value));
};
