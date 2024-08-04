<script lang="ts">
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';
	import type { Trade } from '$lib/types/tradeTypes.js';

	export let data;

	let selectedTrades: Set<Trade> = new Set();
	function toggleSelection(trade: Trade) {
		selectedTrades.has(trade) ? selectedTrades.delete(trade) : selectedTrades.add(trade);
		selectedTrades = selectedTrades;
	}

	let editedNotes: { [key: number]: string } = {};
	function handleNoteChange(trade: Trade, newNote: string) {
		if (newNote !== data.trades.find((t) => t.id === trade.id)?.notes) {
			editedNotes[trade.id] = newNote;
			if (!selectedTrades.has(trade)) {
				selectedTrades.add(trade);
				selectedTrades = selectedTrades;
			}
		} else {
			delete editedNotes[trade.id];
			if (selectedTrades.has(trade)) {
				selectedTrades.delete(trade);
				selectedTrades = selectedTrades;
			}
		}
		editedNotes = editedNotes;
	}

	$: hasEditedNotes = Object.keys(editedNotes).length > 0;
</script>

<svelte:head>
	<title>Trade history</title>
	<meta
		name="description"
		content="Allows users to see their past trades and be able to get insights out of it."
	/>
</svelte:head>

<div class="w-full">
	<HistoryNavBar {selectedTrades} {hasEditedNotes} />
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
							<input
								type="checkbox"
								class="checkbox"
								on:change={() => toggleSelection(trade)}
								checked={selectedTrades.has(trade)}
							/>
						</label>
					</td>
					<td>{trade.ticker}</td>
					<td>{trade.region}</td>
					<td>{trade.volume}</td>
					<td>$ {trade.price}</td>
					<td>{trade.platform}</td>
					<td>{trade.tradeSide}</td>
					<td>{new Date(trade.executedAt).toLocaleDateString()}</td>
					<td>
						<textarea
							placeholder="Notes"
							class="textarea textarea-bordered textarea-xs w-full max-w-xs"
							value={editedNotes[trade.id] !== undefined ? editedNotes[trade.id] : trade.notes}
							on:input={(e) => handleNoteChange(trade, e.currentTarget.value)}
						></textarea>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
