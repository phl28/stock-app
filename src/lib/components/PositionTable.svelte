<script lang="ts">
	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Position } from '$lib/types/tradeTypes';
	import PositionNavBar from './PositionNavBar.svelte';

	export let positions: Position[];

	let editedNotes: Map<number, string> = new Map<number, string>();
	const handleNoteChange = (position: Position, newNote: string) => {
		if (newNote !== positions.find((p) => p.id === position.id)?.notes) {
			editedNotes.set(position.id, newNote);
		} else {
			editedNotes.delete(position.id);
		}
		editedNotes = editedNotes;
	};

	$: hasEditedNotes = editedNotes.size > 0;
</script>

<div class="w-full">
	<PositionNavBar {hasEditedNotes} editedPositions={editedNotes} />
	<div class="overflow-x-auto">
		<table class="table table-pin-rows table-pin-cols table-xs">
			<thead>
				<tr>
					<td>Active</td>
					<td>Ticker</td>
					<td>Platform</td>
					<td>Region</td>
					<td>Quantity</td>
					<td>Average Price</td>
					<td>Total Cost</td>
					<td>Realized Profit/Loss</td>
					<td>Opened At</td>
					<td>Notes</td>
				</tr>
			</thead>
			<tbody>
				{#each positions as position}
					<tr>
						<td>
							<label>
								<input type="checkbox" class="checkbox" checked={!position.closed} disabled />
							</label>
						</td>
						<td>{position.ticker}</td>
						<td>{position.platform}</td>
						<td>{position.region}</td>
						<td>{position.volume}</td>
						<td
							>{formatCurrency(position.averagePrice, position.region === 'US' ? 'USD' : 'HKD')}</td
						>
						<td>{formatCurrency(position.totalCost, position.region === 'US' ? 'USD' : 'HKD')}</td>
						<td
							>{formatCurrency(
								position.realizedProfitLoss,
								position.region === 'US' ? 'USD' : 'HKD'
							)}</td
						>
						<td>{new Date(position.openedAt).toLocaleDateString()}</td>
						<td>
							<textarea
								placeholder="Notes"
								class="textarea textarea-bordered textarea-xs w-full max-w-xs"
								value={editedNotes.get(position.id) !== undefined
									? editedNotes.get(position.id)
									: position.notes}
								on:input={(e) => handleNoteChange(position, e.currentTarget.value)}
							></textarea>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
