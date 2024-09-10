<script lang="ts">
	import TradeHistoryTable from '$lib/components/TradeHistoryTable.svelte';
	import PositionsTable from '$lib/components/PositionTable.svelte';
	export let data;
	$: ({ positions = [], trades = [] } = data);
</script>

<svelte:head>
	<title>Trade</title>
	<meta
		name="description"
		content="Allows users to see their past trades and be able to get insights out of it."
	/>
</svelte:head>

<div class="flex w-10/12 flex-row gap-8">
	<PositionsTable {positions} />
	<TradeHistoryTable {trades} />
</div>
