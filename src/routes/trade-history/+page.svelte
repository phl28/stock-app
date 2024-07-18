<script>
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';
	import { platform } from '../../server/db/schema';

	export let data;
</script>

<svelte:head>
	<title>Trade history</title>
	<meta
		name="description"
		content="Allows users to see their past trades and be able to get insights out of it."
	/>
</svelte:head>

<div class="w-full">
	<HistoryNavBar />
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
							<input type="checkbox" class="checkbox" />
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
						></textarea>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
