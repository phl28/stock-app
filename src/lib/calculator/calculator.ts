import { checkPercentage } from '$lib/helpers/dataHelpers';

// Used in the calculator page (all percentages are represented as a number between 0 and 1)

/**
 * To calculate the stop loss percentage
 * @param entry entry price
 * @param stop stop price
 * @returns the stop loss percentage
 */
const calcStopLossPerc = (entry: number, stop: number) => {
	if (entry < stop || entry < 0 || stop < 0) return 0;
	return (entry - stop) / entry;
}

/**
 * To calculate the stop loss amount (in dollars)
 * @param entry
 * @param stop
 * @param positionAmt
 * @returns
 */
const calcStopLossAmt = (entry: number, stop: number, positionAmt: number) => {
	if (positionAmt < 0 || entry < stop || entry < 0 || stop < 0) return 0;
	positionAmt = Math.floor(positionAmt);
	return (entry - stop) * positionAmt;
}

/**
 * To caluclate the position amount (e.g. 5 stocks of AAPl)
 * @param accSize
 * @param positionSize this is the position in percentage of the accountSize
 * @param entry
 * @returns
 */
const calcPositionAmt = (accSize: number, positionSize: number, entry: number) => {
	if (accSize < 0 || !checkPercentage(positionSize) || entry < 0) return 0;
	return Math.round((accSize * positionSize) / entry);
}

/**
 * To calculate the position size in percentage (between 0 and 1)
 * @param risk
 * @param stopLossPerc
 * @returns
 */
const calcPositionSize = (risk: number, stopLossPerc: number) => {
	if (!checkPercentage(risk) || !checkPercentage(stopLossPerc)) return 0;
	return risk / stopLossPerc;
}

/**
 * To calculate the profit percentage in this position
 * @param target
 * @param entry
 * @param stopLossPerc
 * @param riskReward
 * @returns
 */
const calcProfitPerc = (
	target?: number,
	entry?: number,
	stopLossPerc?: number,
	riskReward?: number
) => {
	if (riskReward != null && stopLossPerc != null) {
		return riskReward * stopLossPerc;
	}
	if (target != null && entry != null) {
		return (target - entry) / entry;
	}
	return 0;
}

/**
 * To calculate the reward in the total account for this position
 * @param profitPerc
 * @param positionSize
 * @param riskReward
 * @param risk
 * @returns
 */
const calcRewardPerc = (
	profitPerc?: number,
	positionSize?: number,
	riskReward?: number,
	risk?: number
) => {
	if (risk != null && checkPercentage(risk) && riskReward != null) {
		return risk * riskReward;
	}
	if (
		profitPerc != null &&
		positionSize != null &&
		checkPercentage(profitPerc) &&
		checkPercentage(positionSize)
	) {
		return profitPerc * positionSize;
	}
	return 0;
}

/**
 * To calculate the reward to risk ratio
 * @param risk
 * @param reward
 * @returns
 */
const calcRewardToRisk = (risk: number, reward: number) => {
	if (!checkPercentage(risk) || !checkPercentage(reward)) return 0;
	return reward / risk;
}

/**
 * For different types of targets, what is the price that we should leave the position at
 * @param entry
 * @param profitPerc
 * @returns
 */
const calcCoverPrice = (entry: number, profitPerc: number) => {
	if (entry < 0 || !checkPercentage(profitPerc)) return 0;
	return entry * profitPerc + entry;
}

export default {
	calcStopLossPerc,
	calcStopLossAmt,
	calcPositionSize,
	calcPositionAmt,
	calcProfitPerc,
	calcRewardPerc,
	calcRewardToRisk,
	calcCoverPrice
};
