<script lang="ts">
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';
	import { formatCurrency } from '$lib/helpers/currencyHelpers';
	import type { Trade } from '$lib/types/tradeTypes.js';

	export let trades: Trade[];
	// export let allTickers: string[];

	let selectedTrades: Map<number, Trade> = new Map();
	function toggleSelection(trade: Trade) {
		selectedTrades.has(trade.id)
			? selectedTrades.delete(trade.id)
			: selectedTrades.set(trade.id, trade);
		selectedTrades = selectedTrades;
	}

	let editedNotes: { [key: number]: string } = {};
	function handleNoteChange(trade: Trade, newNote: string) {
		if (newNote !== trades.find((t) => t.id === trade.id)?.notes) {
			editedNotes[trade.id] = newNote;
			selectedTrades.set(trade.id, { ...trade, notes: newNote });
			selectedTrades = selectedTrades;
		} else {
			delete editedNotes[trade.id];
			if (selectedTrades.has(trade.id)) {
				selectedTrades.delete(trade.id);
				selectedTrades = selectedTrades;
			}
		}
		editedNotes = editedNotes;
	}

	$: hasEditedNotes = Object.keys(editedNotes).length > 0;
</script>

<div class="w-full">
	<HistoryNavBar {selectedTrades} {hasEditedNotes} />
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
</div>
