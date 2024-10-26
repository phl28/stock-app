export interface StockData {
	time: string;
	open: number;
	high: number;
	low: number;
	close: number;
}

export interface VolumeData {
	time: string;
	value: number;
	color: string;
}

export interface ChartResponse {
	stockData: any;
	smaData: any[];
	error: any;
}
