enum TradeSide {
    BUY = "BUY",
    SELL = "SELL",
    BUY_BACK = "BUY_BACK"
}

enum Platform {
    FUTU = "FUTU",
    IBKR = "IBKR"
}

enum Region {
    US = "US",
    HK = "HK",
    UK = "UK"
}

enum Currency {
    USD = "USD",
    HKD = "HKD",
    EUR = "EUR",
    GBP = "GBP",
    CNY = "CNY"
}

export interface Trade {
    id: string;
    positionId: number | null;
    ticker: string;
    region: Region;
    currency: Currency 
    price: number;
    fees?: number;
    totalValue?: number;
    volume: number;
    platform: Platform;
    side: TradeSide ;
    executedAt?: string;
    profitLoss?: number;
    notes?: string;
}
