<script lang="ts">
	import { enhance } from '$app/forms';
	import { dispatchToast } from '@/routes/stores';
	import type { Position, Trade } from '../types/tradeTypes';
	import { createEventDispatcher, tick } from 'svelte';

	const dispatch = createEventDispatcher();

	export let isModalOpen: boolean = false;
	export let selectedTrades: Map<number, Trade> = new Map();
	export let positionId: number | 'newPosition' | undefined = undefined;
	export let possiblePositions: Position[] = [];
	export let handleCloseModal: () => void;

	let modal: HTMLDialogElement;

	$: (async () => {
		await tick();
		if (modal) {
			if (isModalOpen && !modal.open) {
				modal.showModal();
			} else if (!isModalOpen && modal.open) {
				modal.close();
			}
		}
	})();

	$: localSelectedTrades = new Map(selectedTrades);

	let isShort: boolean = false;
	$: tradeIds = JSON.stringify(Array.from(localSelectedTrades.keys()));
	$: ticker = localSelectedTrades.values().next().value?.ticker ?? '';
	$: region = localSelectedTrades.values().next().value?.region ?? '';
	$: currency = localSelectedTrades.values().next().value?.currency ?? '';
	$: platform = localSelectedTrades.values().next().value?.platform ?? '';

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

	const getSelectedTradesMetrics = (
		selectedTrades: Map<number, Trade>,
		positionId: number | 'newPosition' | undefined
	) => {
		if (!positionId) return {};
		let position: Position | undefined;
		let totalVolume = 0;
		let outstandingVolume = 0;
		let totalFees = 0;
		let totalEntryCost = 0;
		let totalExitCost = 0;
		let boughtShares = 0;
		let soldShares = 0;
		let numOfTrades = selectedTrades.size;
		let openedAt = new Date();
		let positionClosedAt: Date | null = null;
		if (positionId !== 'newPosition') {
			position = possiblePositions.find((position) => position.id === positionId);
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
				isShort = position.isShort;
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
		}

		const metricsFromSelectedTrades = localSelectedTrades.values().reduce<Metric>(
			(acc, trade) => {
				const isBuy = trade.tradeSide === 'BUY';
				return {
					totalVolume:
						isBuy && !isShort
							? acc.totalVolume + trade.volume
							: isShort && !isBuy
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
			averageEntryPrice,
			averageExitPrice,
			totalVolume,
			outstandingVolume,
			totalFees,
			totalEntryCost,
			totalExitCost,
			numOfTrades,
			openedAt,
			closedAt: outstandingVolume === 0 ? latestExecution : null
		};
	};

	$: metrics = getSelectedTradesMetrics(localSelectedTrades, positionId);
</script>

<dialog id="assign-position-modal" class="modal" bind:this={modal}>
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
						dispatch('assigned');
					} else if (result.type === 'error') {
						dispatchToast({ type: 'error', message: result.error.message });
					}
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
				<input type="hidden" name="tradeIds" value={tradeIds} />
				<div class={positionId === 'newPosition' ? 'form-control' : 'hidden'}>
					<label class="label cursor-pointer">
						<span class="label-text">Short Position</span>
						<input
							type="checkbox"
							class="toggle"
							checked={isShort}
							name="isShort"
							on:change={() => (isShort = !isShort)}
						/>
					</label>
				</div>
				<div class="hidden">
					<div class="label">
						<span class="label-text">Ticker</span>
					</div>
					<input
						type="text"
						class="input pointer-events-none w-full px-1 py-0"
						value={ticker}
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
						value={region}
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
						value={currency}
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
						value={metrics.numOfTrades}
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
						value={platform}
						name="platform"
						tabIndex="-1"
						readonly
					/>

					<div class="label">
						<span class="label-text">Opened At</span>
					</div>
					<input
						type="date"
						class="input pointer-events-none w-full px-1 py-0"
						value={metrics.openedAt?.toISOString().split('T')[0] ?? null}
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
						value={metrics.closedAt?.toISOString().split('T')[0] ?? null}
						name="closedAt"
						tabIndex="-1"
						readonly
					/>
				</div>
				<div class="modal-action">
					<button class="btn" type="button" on:click={handleCloseModal}>Close</button>
					<button class="btn btn-primary" type="submit" disabled={positionId === undefined}
						>Add</button
					>
				</div>
			</div>
		</form>
	</div>
	<div class="modal-backdrop">
		<button type="button" on:click={handleCloseModal}>close</button>
	</div>
</dialog>
