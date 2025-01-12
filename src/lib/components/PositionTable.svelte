<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Position } from '$lib/types/tradeTypes';
	import PositionNavBar from './PositionNavBar.svelte';

	export let positions: Position[];

	const handlePositionRowClick = (position: Position) => {
		goto('/position/' + position.id);
	};
</script>

<div class="w-full">
	<PositionNavBar numOfPositions={positions.length} />
	<div class="overflow-x-auto">
		<table class="table table-pin-rows table-pin-cols table-xs">
			<thead>
				<tr>
					<td>Active</td>
					<td>Side</td>
					<td>Ticker</td>
					<td>Platform</td>
					<td>Region</td>
					<td>Number of Trades</td>
					<td>Quantity</td>
					<td>Average Price</td>
					<td>Gross Profit/Loss</td>
					<td>Opened At</td>
				</tr>
			</thead>
			<tbody>
				{#each positions as position}
					<tr on:click={() => handlePositionRowClick(position)} style="cursor: pointer">
						<td>
							<label>
								<input type="checkbox" class="checkbox" checked={!position.closedAt} disabled />
							</label>
						</td>
						<td>{position.isShort ? 'Short' : 'Long'}</td>
						<td>{position.ticker}</td>
						<td>{position.platform}</td>
						<td>{position.region}</td>
						<td>{position.numOfTrades}</td>
						<td>{position.totalVolume}</td>
						<td
							>{formatCurrency(
								position.averageEntryPrice,
								position.region === 'US' ? 'USD' : 'HKD'
							)}</td
						>
						<td
							>{formatCurrency(
								position.grossProfitLoss,
								position.region === 'US' ? 'USD' : 'HKD'
							)}</td
						>
						<td>{new Date(position.openedAt).toLocaleDateString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
