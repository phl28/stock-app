import type { Trade } from './tradeTypes';

export type FutuResponse = {
	trades: Omit<Trade, 'id' | 'notes' | 'createdAt' | 'updatedAt'>[];
	error?: string;
};
