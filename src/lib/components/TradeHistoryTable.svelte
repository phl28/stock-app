<script lang="ts">
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';
	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Trade, Position } from '$lib/types/tradeTypes';

	export let trades: Trade[];
	export let positions: Position[];

	let selectedTrades: Map<number, Trade> = new Map();
	let selectedAllAssigned: boolean = false;
	let selectedAllUnassigned: boolean = false;

	const toggleSelection = (trade: Trade, type: 'assigned' | 'unassigned') => {
		if (selectedTrades.has(trade.id)) {
			selectedTrades.delete(trade.id);
			if (type === 'assigned' && selectedAllAssigned) {
				selectedAllAssigned = false;
			} else if (type === 'unassigned' && selectedAllUnassigned) {
				selectedAllUnassigned = false;
			}
		} else {
			selectedTrades.set(trade.id, trade);
		}
		selectedTrades = selectedTrades;
	};

	const toggleSelectionUnassigned = (trade: Trade) => {
		toggleSelection(trade, 'unassigned');
	};

	const toggleSelectionAssigned = (trade: Trade) => {
		toggleSelection(trade, 'assigned');
	};

	let assignedTrades: Trade[] = [];
	let unassignedTrades: Trade[] = [];

	const toggleSelectAllAssigned = () => {
		if (selectedAllAssigned) {
			selectedTrades = new Map();
		} else {
			selectedTrades = new Map(assignedTrades.map((trade) => [trade.id, trade]));
		}
		selectedAllAssigned = !selectedAllAssigned;
	};

	const toggleSelectAllUnassigned = () => {
		if (selectedAllUnassigned) {
			selectedTrades = new Map();
		} else {
			selectedTrades = new Map(unassignedTrades.map((trade) => [trade.id, trade]));
		}
		selectedAllUnassigned = !selectedAllUnassigned;
	};

	$: {
		assignedTrades = [];
		unassignedTrades = [];
		for (const trade of trades) {
			if (trade.positionId) {
				assignedTrades = [...assignedTrades, trade];
			} else {
				unassignedTrades = [...unassignedTrades, trade];
			}
		}
	}
</script>

<div class="w-full">
	<HistoryNavBar bind:selectedTrades numOfTrades={trades.length} {positions} />
	<div class="my-2 overflow-x-auto">
		<h5 class="mt-6 text-center">Unassigned Trades ({unassignedTrades.length})</h5>
		<table class="table table-pin-rows table-pin-cols table-xs">
			<thead>
				<tr>
					<td
						><label>
							<input
								type="checkbox"
								class="checkbox"
								on:change={toggleSelectAllUnassigned}
								checked={selectedAllUnassigned}
								disabled={Array.from(selectedTrades.keys()).some((id) =>
									assignedTrades.some((assignedTrade) => assignedTrade.id === id)
								)}
							/>
						</label></td
					>
					<td>Ticker</td>
					<td>Region</td>
					<td>Quantity</td>
					<td>Price</td>
					<td>Platform</td>
					<td>Side</td>
					<td>Executed At</td>
				</tr>
			</thead>
			<tbody>
				{#each unassignedTrades as trade}
					<tr>
						<td>
							<label>
								<input
									type="checkbox"
									class="checkbox"
									on:change={() => toggleSelectionUnassigned(trade)}
									checked={selectedTrades.has(trade.id)}
									disabled={Array.from(selectedTrades.keys()).some((id) =>
										assignedTrades.some((assignedTrade) => assignedTrade.id === id)
									)}
								/>
							</label>
						</td>
						<td>{trade.ticker}</td>
						<td>{trade.region}</td>
						<td>{trade.volume}</td>
						<td>{formatCurrency(trade.price, trade.region === 'US' ? 'USD' : 'HKD')}</td>
						<td>{trade.platform}</td>
						<td>{trade.tradeSide}</td>
						<td>{new Date(trade.executedAt).toLocaleDateString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="overflow-x-auto">
		<h5 class="mt-6 text-center">Assigned Trades ({assignedTrades.length})</h5>
		<table class="table table-pin-rows table-pin-cols table-xs">
			<thead>
				<tr>
					<td
						><label>
							<input
								type="checkbox"
								class="checkbox"
								on:change={toggleSelectAllAssigned}
								checked={selectedAllAssigned}
								disabled={Array.from(selectedTrades.keys()).some((id) =>
									unassignedTrades.some((unassignedTrade) => unassignedTrade.id === id)
								)}
							/>
						</label></td
					>
					<td>Ticker</td>
					<td>Region</td>
					<td>Quantity</td>
					<td>Price</td>
					<td>Platform</td>
					<td>Side</td>
					<td>Executed At</td>
				</tr>
			</thead>
			<tbody>
				{#each assignedTrades as trade}
					<tr>
						<td>
							<label>
								<input
									type="checkbox"
									class="checkbox"
									on:change={() => toggleSelectionAssigned(trade)}
									checked={selectedTrades.has(trade.id)}
									disabled={Array.from(selectedTrades.keys()).some((id) =>
										unassignedTrades.some((unassignedTrade) => unassignedTrade.id === id)
									)}
								/>
							</label>
						</td>
						<td>{trade.ticker}</td>
						<td>{trade.region}</td>
						<td>{trade.volume}</td>
						<td>{formatCurrency(trade.price, trade.region === 'US' ? 'USD' : 'HKD')}</td>
						<td>{trade.platform}</td>
						<td>{trade.tradeSide}</td>
						<td>{new Date(trade.executedAt).toLocaleDateString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
