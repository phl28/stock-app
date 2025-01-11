<script lang="ts">
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';
	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Trade, Position } from '$lib/types/tradeTypes';

	export let trades: Trade[];
	export let positions: Position[];

	let selectedTrades: Map<number, Trade> = new Map();
	let selectedAllUnassigned: boolean = false;

	const toggleSelection = (trade: Trade) => {
		if (selectedTrades.has(trade.id)) {
			selectedTrades.delete(trade.id);
			if (selectedAllUnassigned) {
				selectedAllUnassigned = false;
			}
		} else {
			selectedTrades.set(trade.id, trade);
		}
		selectedTrades = selectedTrades;
	};

	const toggleSelectionUnassigned = (trade: Trade) => {
		toggleSelection(trade);
	};

	let unassignedTrades: Trade[] = [];

	const toggleSelectAllUnassigned = () => {
		if (selectedAllUnassigned) {
			selectedTrades = new Map();
		} else {
			selectedTrades = new Map(unassignedTrades.map((trade) => [trade.id, trade]));
		}
		selectedAllUnassigned = !selectedAllUnassigned;
	};

	$: {
		unassignedTrades = [];
		for (const trade of trades) {
			if (trade.positionId) {
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
