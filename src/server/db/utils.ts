import type { SelectTrade, SelectPosition, InsertPosition } from './database';

type Metric = {
	totalVolume: number;
	outstandingVolume: number;
	boughtShares: number;
	soldShares: number;
	totalEntryCost: number;
	totalExitCost: number;
	totalFees: number;
	openedAt: Date;
	latestExecution: Date | null;
};

/**
 *
 * @param trades always required
 * @param position require if isShort is undefined
 * @param isShort require if position is undefined
 * @returns position information
 */
export const getPositionInfoFromTrades = ({
	trades,
	position,
	isShort
}: {
	trades: SelectTrade[];
	position?: SelectPosition;
	isShort?: boolean;
}): InsertPosition => {
	const ticker = position?.ticker ?? trades.at(0)?.ticker;
	if (!ticker) throw new Error('Ticker is required');
	let totalVolume = 0;
	let outstandingVolume = 0;
	let totalFees = 0;
	let totalEntryCost = 0;
	let totalExitCost = 0;
	let boughtShares = 0;
	let soldShares = 0;
	let numOfTrades = trades.length;
	let openedAt = new Date();
	let positionClosedAt: Date | null = null;
	let shortPosition = isShort;
	if (position) {
		totalVolume = position.totalVolume;
		outstandingVolume = position.outstandingVolume;
		totalFees = Number(position.totalFees);
		totalEntryCost = !position.isShort
			? Number(position.averageEntryPrice) * position.totalVolume
			: Number(position.averageEntryPrice) *
				Math.abs(position.totalVolume - position.outstandingVolume);
		totalExitCost = !position.isShort
			? Number(position.averageExitPrice) * (position.totalVolume - position.outstandingVolume)
			: Number(position.averageExitPrice) * Math.abs(totalVolume);
		shortPosition = position.isShort;
		boughtShares = !position.isShort
			? position.totalVolume
			: Math.abs(position.totalVolume - position.outstandingVolume);
		soldShares = position.isShort
			? position.totalVolume
			: Math.abs(position.totalVolume - position.outstandingVolume);
		numOfTrades += position.numOfTrades;
		openedAt = position.openedAt < openedAt ? position.openedAt : openedAt;
		positionClosedAt = position.closedAt;
	}

	const metricsFromSelectedTrades = trades.reduce<Metric>(
		(acc, trade) => {
			const isBuy = trade.tradeSide === 'BUY';
			return {
				totalVolume:
					isBuy && !shortPosition
						? acc.totalVolume + trade.volume
						: shortPosition && !isBuy
							? acc.totalVolume - trade.volume
							: acc.totalVolume,
				outstandingVolume: isBuy
					? acc.outstandingVolume + trade.volume
					: acc.outstandingVolume - trade.volume,
				boughtShares: isBuy ? acc.boughtShares + trade.volume : acc.boughtShares,
				soldShares: !isBuy ? acc.soldShares + trade.volume : acc.soldShares,
				totalEntryCost: isBuy
					? acc.totalEntryCost + Number(trade.price) * trade.volume
					: acc.totalEntryCost,
				totalExitCost: !isBuy
					? acc.totalExitCost + Number(trade.price) * trade.volume
					: acc.totalExitCost,
				totalFees: acc.totalFees + Number(trade.fees),
				openedAt: trade.executedAt < acc.openedAt ? trade.executedAt : acc.openedAt,
				latestExecution:
					!acc.latestExecution || (acc.latestExecution && trade.executedAt > acc.latestExecution)
						? trade.executedAt
						: acc.latestExecution
			};
		},
		{
			totalVolume,
			outstandingVolume,
			boughtShares,
			soldShares,
			totalEntryCost,
			totalExitCost,
			totalFees,
			openedAt,
			latestExecution: null
		}
	);
	let averageEntryPrice =
		metricsFromSelectedTrades.totalEntryCost / metricsFromSelectedTrades.boughtShares;
	let averageExitPrice =
		metricsFromSelectedTrades.totalExitCost / metricsFromSelectedTrades.soldShares;
	totalVolume = metricsFromSelectedTrades.totalVolume;
	outstandingVolume = metricsFromSelectedTrades.outstandingVolume;
	totalFees = metricsFromSelectedTrades.totalFees;
	totalEntryCost = metricsFromSelectedTrades.totalEntryCost;
	totalExitCost = metricsFromSelectedTrades.totalExitCost;
	const latestExecution =
		metricsFromSelectedTrades.latestExecution &&
		(!positionClosedAt || metricsFromSelectedTrades.latestExecution > positionClosedAt)
			? metricsFromSelectedTrades.latestExecution
			: positionClosedAt;

	return {
		ticker,
		region: position?.region ?? trades.at(0)?.region,
		currency: position?.currency ?? trades.at(0)?.currency,
		totalVolume,
		outstandingVolume,
		averageEntryPrice: averageEntryPrice.toString() === '' ? '0' : averageEntryPrice.toString(),
		averageExitPrice: averageExitPrice.toString() === '' ? null : averageExitPrice.toString(),
		profitTargetPrice: null,
		stopLossPrice: null,
		grossProfitLoss: null,
		totalFees: totalFees.toString(),
		isShort: shortPosition ?? false,
		platform: position?.platform ?? trades.at(0)?.platform,
		numOfTrades,
		notes: '',
		openedAt,
		closedAt: outstandingVolume === 0 ? latestExecution : null,
		reviewedAt: null,
		updatedAt: new Date(),
		createdBy: position?.createdBy ?? '',
		journal: null
	};
};
