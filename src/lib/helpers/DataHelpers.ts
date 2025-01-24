export const convertUnixTimestampToDate = (unixTimestamp: number) => {
	const date = new Date(unixTimestamp);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export function formatDuration(startDate: Date, endDate: Date): string {
	const diffMs = endDate.getTime() - startDate.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays < 30) {
		return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
	}

	const diffMonths = Math.floor(diffDays / 30);
	if (diffMonths < 12) {
		return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
	}

	const diffYears = Math.floor(diffDays / 365);
	const remainingMonths = Math.floor((diffDays % 365) / 30);

	if (remainingMonths === 0) {
		return `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
	}

	return `${diffYears} year${diffYears !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * This function is used to check if a percentage is valid, a percentage is valid if it is between 0 and 1 when allowOverHundred is false
 * @param percentage
 * @param allowNeg
 * @param allowOverHundred
 * @returns
 */
export const checkPercentage = (
	percentage: number,
	allowNeg: boolean = false,
	allowOverHundred: boolean = false
) => {
	let valid = true;
	if (!allowNeg && percentage < 0) {
		valid = false;
	}
	if (!allowOverHundred && Math.abs(percentage) > 1) {
		valid = false;
	}
	return valid;
};
