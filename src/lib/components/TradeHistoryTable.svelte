<script lang="ts">
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';
	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Trade } from '$lib/types/tradeTypes';

	export let trades: Trade[];

	let selectedTrades: Map<number, Trade> = new Map();
	const toggleSelection = (trade: Trade) => {
		if (selectedTrades.has(trade.id)) {
			selectedTrades.delete(trade.id);
			if (selectedAll) {
				selectedAll = false;
			}
		} else {
			selectedTrades.set(trade.id, trade);
		}
		selectedTrades = selectedTrades;
	};
	let selectedAll: boolean = false;
	const toggleSelectAll = () => {
		selectedAll
			? selectedTrades.clear()
			: (selectedTrades = new Map(trades.map((trade) => [trade.id, trade])));
		selectedAll = !selectedAll;
	};
</script>

<div class="w-full">
	<HistoryNavBar {selectedTrades} />
	<div class="overflow-x-auto">
		<table class="table table-pin-rows table-pin-cols table-xs">
			<thead>
				<tr>
					<td
						><label>
							<input
								type="checkbox"
								class="checkbox"
								on:change={toggleSelectAll}
								checked={selectedAll}
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
				{#each trades as trade}
					<tr>
						<td>
							<label>
								<input
									type="checkbox"
									class="checkbox"
									on:change={() => toggleSelection(trade)}
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
