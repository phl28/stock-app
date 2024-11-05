export const generatePageNumbers = (
	currentPage: number,
	totalPages: number
): (number | string)[] => {
	if (totalPages <= 4) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	let pageNumbers: (number | string)[] = [];
	if (totalPages - currentPage > 2) {
		if (currentPage === 1) {
			return [currentPage, currentPage + 1, '...', totalPages - 1, totalPages];
		} else if (currentPage === 3) {
			pageNumbers = [1];
		} else if (currentPage !== 2) {
			pageNumbers = [1, '...'];
		}
		return [...pageNumbers, currentPage - 1, currentPage, '...', totalPages - 1, totalPages];
	} else {
		const restOfPages = Array.from(
			{ length: totalPages - currentPage },
			(_, i) => i + currentPage + 1
		);
		return [1, '...', currentPage, ...restOfPages];
	}
};
