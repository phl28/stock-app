export const mockTrades = [
	{
		// expectedRowIndex refers to the index of the row when the trade is added, they are ordered by executedAt
		ticker: 'AAPL',
		region: 'US',
		price: '$100.00',
		fees: '$0.00',
		volume: '10',
		platform: 'FUTU',
		side: 'BUY',
		executedAt: '2025-02-27'
	},
	{
		ticker: 'AAPL',
		region: 'US',
		price: '$200.00',
		fees: '$0.00',
		volume: '10',
		platform: 'FUTU',
		side: 'BUY',
		executedAt: '2025-02-25'
	},
	{
		ticker: 'MSFT',
		region: 'US',
		price: '$300.00',
		fees: '$1.00',
		volume: '100',
		platform: 'FUTU',
		side: 'BUY',
		executedAt: '2025-02-28'
	}
];

export const mockPositions = [
	{
		expectedRowIndex: '0',
		isShort: 'LONG',
		ticker: 'AAPL',
		region: 'US',
		platform: 'FUTU',
		numOfTrades: '2',
		totalVolume: '20',
		averageEntryPrice: '$150.00',
		averageExitPrice: undefined,
		grossProfitLoss: undefined,
		openedAt: '2025-02-25',
		netProfitLoss: undefined,
		totalFees: '$0.00',
		entryPrice: '$200.00',
		exitPrice: undefined
	}
];
