<script lang="ts">
	import TradeHistoryTable from '$lib/components/TradeHistoryTable.svelte';
	import PositionsTable from '$lib/components/PositionTable.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ positions = [], trades = [] } = data);
	let view = 'trades';
</script>

<svelte:head>
	<title>Trade</title>
	<meta
		name="description"
		content="Allows users to see their past trades and be able to get insights out of it."
	/>
</svelte:head>

<div class="flex w-full flex-col px-10">
	<select class="select select-bordered w-full max-w-xs" bind:value={view}>
		<option value="trades">Trades</option>
		<option value="positions">Positions</option>
	</select>
	{#if view === 'trades'}
		<TradeHistoryTable {trades} />
	{:else if view === 'positions'}
		<PositionsTable {positions} />
	{/if}
</div>
