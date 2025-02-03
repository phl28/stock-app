export const Region = {
	US: 'US',
	HK: 'HK',
	UK: 'UK'
} as const;

export const Platform = {
	FUTU: 'FUTU',
	IBKR: 'IBKR'
} as const;

export const TradeSide = {
	BUY: 'BUY',
	SELL: 'SELL'
} as const;

export const Currency = {
	USD: 'USD',
	HKD: 'HKD',
	EUR: 'EUR',
	GBP: 'GBP',
	CNY: 'CNY'
} as const;

export type Region = (typeof Region)[keyof typeof Region];
export type Platform = (typeof Platform)[keyof typeof Platform];
export type TradeSide = (typeof TradeSide)[keyof typeof TradeSide];
export type Currency = (typeof Currency)[keyof typeof Currency];

export type Trade = {
	id: number;
	positionId: number | null;
	ticker: string;
	region: Region;
	currency: Currency;
	price: string;
	fees: string | null;
	volume: number;
	platform: Platform;
	tradeSide: TradeSide;
	executedAt: Date;
	createdAt: Date;
	updatedAt: Date | null;
	createdBy: string;
};

export type Position = {
	id: number;
	ticker: string;
	region: Region;
	currency: Currency;
	totalVolume: number;
	outstandingVolume: number;
	averageEntryPrice: string;
	averageExitPrice: string | null;
	profitTargetPrice: string | null;
	stopLossPrice: string | null;
	grossProfitLoss: string | null;
	totalFees: string;
	isShort: boolean;
	platform: Platform;
	numOfTrades: number;
	notes: string | null;
	openedAt: Date;
	closedAt: Date | null;
	reviewedAt: Date | null;
	updatedAt: Date;
	createdBy: string;
	journal: unknown | null;
};
