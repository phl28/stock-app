<script lang="ts">
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';

	export let data;

	let selectedTrades: Set<number> = new Set();
	function toggleSelection(id: number) {
		selectedTrades.has(id) ? selectedTrades.delete(id) : selectedTrades.add(id);
		selectedTrades = selectedTrades;
	}
</script>

<svelte:head>
	<title>Trade history</title>
	<meta
		name="description"
		content="Allows users to see their past trades and be able to get insights out of it."
	/>
</svelte:head>

<div class="w-full">
	<HistoryNavBar {selectedTrades} />
</div>
<div class="overflow-x-auto">
	<table class="table table-pin-rows table-pin-cols table-xs">
		<thead>
			<tr>
				<td>Active</td>
				<td>Ticker</td>
				<td>Region</td>
				<td>Quantity</td>
				<td>Price</td>
				<td>Platform</td>
				<td>Side</td>
				<td>Executed At</td>
				<td>Notes</td>
			</tr>
		</thead>
		<tbody>
			{#each data.trades as trade}
				<tr>
					<td>
						<label>
							<input type="checkbox" class="checkbox" on:change={() => toggleSelection(trade.id)} />
						</label>
					</td>
					<td>{trade.ticker}</td>
					<td>{trade.region}</td>
					<td>{trade.volume}</td>
					<td>$ {trade.price}</td>
					<td>{trade.platform}</td>
					<td>{trade.side}</td>
					<td>{new Date(trade.executedAt).toLocaleDateString()}</td>
					<td>
						<textarea
							placeholder="Notes"
							class="textarea textarea-bordered textarea-xs w-full max-w-xs"
							bind:value={trade.notes}
						></textarea>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
