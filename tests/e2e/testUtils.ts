export function extractNumberFromBrackets(text: string): number {
	const match = text.match(/\((\d+)\)/);

	if (match && match[1]) {
		return parseInt(match[1], 10);
	}

	return 0;
}
