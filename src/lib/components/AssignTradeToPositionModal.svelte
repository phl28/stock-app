<script lang="ts">
	import { enhance } from '$app/forms';
	import { dispatchToast } from '@/routes/stores';
	import type { Position, Trade } from '../types/tradeTypes';

	export let selectedTrades: Map<number, Trade> = new Map();
	export let positionId: number | 'newPosition' | undefined = undefined;
	export let possiblePositions: Position[] = [];
	export let handleCloseModal: () => void;

	let direction: 'LONG' | 'SHORT' = 'LONG';

	const getSelectedTradesMetrics = (
		selectedTrades: Map<number, Trade>,
		positionId: number | 'newPosition' | undefined
	) => {
		const metricsFromSelectedTrades = selectedTrades.values().reduce(
			(acc, trade) => {
				const isBuy = trade.tradeSide === 'BUY';
				return {
					totalVolume: acc.totalVolume + trade.volume,
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
					totalFees: acc.totalFees + Number(trade.fees)
				};
			},
			{
				totalVolume: 0,
				outstandingVolume: 0,
				boughtShares: 0,
				soldShares: 0,
				totalEntryCost: 0,
				totalExitCost: 0,
				totalFees: 0
			}
		);
		// if (!newPosition)
		return {
			averageEntryPrice:
				metricsFromSelectedTrades.totalEntryCost / metricsFromSelectedTrades.boughtShares,
			averageExitPrice:
				metricsFromSelectedTrades.totalExitCost / metricsFromSelectedTrades.soldShares,
			totalVolume: metricsFromSelectedTrades.totalVolume,
			outstandingVolume: metricsFromSelectedTrades.outstandingVolume,
			totalFees: metricsFromSelectedTrades.totalFees,
			totalEntryCost: metricsFromSelectedTrades.totalEntryCost,
			totalExitCost: metricsFromSelectedTrades.totalExitCost
		};
	};

	$: metrics = getSelectedTradesMetrics(selectedTrades, positionId);
</script>

<dialog id="assign-position-modal" class="modal">
	<div class="modal-box">
		<h3 class="mb-2 text-lg font-bold">Assign the selected trades to a position</h3>
		<form
			method="POST"
			action="?/assignTradesToPosition"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						dispatchToast({
							type: 'success',
							message: 'Trades assigned to position successfully!'
						});
						await update();
					} else if (result.type === 'error') {
						dispatchToast({ type: 'error', message: result.error.message });
					}
					selectedTrades = new Map();
					handleCloseModal();
				};
			}}
		>
			<select
				class="select select-bordered select-sm w-full"
				bind:value={positionId}
				name="positionId"
			>
				<option disabled selected value={undefined}
					>Select the position to assign these trades to?</option
				>
				{#each possiblePositions as position}
					<option value={position.id}
						>({position.isShort ? 'Short' : 'Long'}) {position.ticker} Opened At: {position.openedAt}</option
					>
				{/each}
				<option value="newPosition">Assign to new position</option>
			</select>
			<div class="form-control w-full">
				<input
					type="hidden"
					name="tradeIds"
					value={JSON.stringify(Array.from(selectedTrades.keys()))}
				/>
				<div class={`${positionId === 'newPosition' ? 'visible' : 'hidden'}`}>
					<div class="label">
						<span class="label-text">Ticker</span>
					</div>
					<input
						type="text"
						class="input pointer-events-none w-full px-1 py-0"
						value={selectedTrades.values().next().value?.ticker ?? ''}
						name="ticker"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Region</span>
					</div>
					<input
						type="text"
						class="input pointer-events-none w-full px-1 py-0"
						value={selectedTrades.values().next().value?.region ?? ''}
						name="region"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Currency</span>
					</div>
					<input
						type="text"
						class="input pointer-events-none w-full px-1 py-0"
						value={selectedTrades.values().next().value?.currency ?? ''}
						name="currency"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Number of Trades</span>
					</div>
					<input
						type="number"
						class="input pointer-events-none w-full px-1 py-0"
						value={selectedTrades.size}
						name="numOfTrades"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Average Entry Price</span>
					</div>
					<input
						type="number"
						class="input pointer-events-none w-full px-1 py-0"
						value={metrics.averageEntryPrice}
						name="averageEntryPrice"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Average Exit Price</span>
					</div>
					<input
						type="number"
						class="input pointer-events-none w-full px-1 py-0"
						value={metrics.averageExitPrice}
						name="averageExitPrice"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Total Fees</span>
					</div>
					<input
						type="number"
						class="input pointer-events-none w-full px-1 py-0"
						value={metrics.totalFees}
						name="fees"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Total Volume</span>
					</div>
					<input
						type="number"
						class="input pointer-events-none w-full px-1 py-0"
						value={metrics.totalVolume}
						name="totalVolume"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Outstanding Volume</span>
					</div>
					<input
						type="number"
						class="input pointer-events-none w-full px-1 py-0"
						value={metrics.outstandingVolume}
						name="outstandingVolume"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Gross P/L</span>
					</div>
					<input
						type="number"
						class="input pointer-events-none w-full px-1 py-0"
						value={metrics.outstandingVolume === 0
							? metrics.totalExitCost - metrics.totalEntryCost
							: null}
						name="grossProfitLoss"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Platform</span>
					</div>
					<input
						type="text"
						class="input pointer-events-none w-full px-1 py-0"
						value={selectedTrades.values().next().value?.platform ?? ''}
						name="platform"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Direction</span>
					</div>
					<select
						class="select select-bordered w-full px-1 py-0"
						bind:value={direction}
						name="side"
						required
					>
						<option value="LONG">Long</option>
						<option value="SHORT">Short</option>
					</select>
					<div class="label">
						<span class="label-text">Opened At</span>
					</div>
					<input
						type="date"
						class="input pointer-events-none w-full px-1 py-0"
						value={selectedTrades.size > 0
							? new Date(
									Math.min(
										...[...selectedTrades.values()].map((trade) => trade.executedAt.getTime())
									)
								)
									.toISOString()
									.split('T')[0]
							: null}
						name="openedAt"
						tabIndex="-1"
						readonly
					/>
					<div class="label">
						<span class="label-text">Closed At</span>
					</div>
					<input
						type="date"
						class="input pointer-events-none w-full px-1 py-0"
						value={metrics.outstandingVolume === 0 && selectedTrades.size > 0
							? new Date(
									Math.max(
										...[...selectedTrades.values()].map((trade) => trade.executedAt.getTime())
									)
								)
									.toISOString()
									.split('T')[0]
							: null}
						name="closedAt"
						tabIndex="-1"
						readonly
					/>
				</div>
				<div class="modal-action">
					<form method="dialog">
						<button class="btn">Close</button>
					</form>
					<button class="btn btn-primary" type="submit" disabled={positionId === undefined}
						>Add</button
					>
				</div>
			</div>
		</form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
