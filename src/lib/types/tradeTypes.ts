export const Region = {
    US: "US",
    HK: "HK",
    UK: "UK"
} as const;

export const Platform = {
    FUTU: "FUTU",
    IBKR: "IBKR"
} as const;

export const TradeSide = {
    BUY: "BUY",
    SELL: "SELL",
    BUY_BACK: "BUY_BACK"
} as const;

export const Currency = {
    USD: "USD",
    HKD: "HKD",
    EUR: "EUR",
    GBP: "GBP",
    CNY: "CNY"
} as const;

export type Region = typeof Region[keyof typeof Region];
export type Platform = typeof Platform[keyof typeof Platform];
export type TradeSide = typeof TradeSide[keyof typeof TradeSide];
export type Currency = typeof Currency[keyof typeof Currency];

export type Trade = {
    id: number;
    positionId: number | null;
    ticker: string;
    region: Region;
    currency: Currency;
    price: string;
    fees: string | null;
    totalValue: string;
    volume: number;
    platform: Platform;
    tradeSide: TradeSide;
    executedAt: Date;
    profitLoss: string | null;
    notes: string | null;
}
