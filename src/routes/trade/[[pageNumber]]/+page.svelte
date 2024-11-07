<script lang="ts">
	import TradeHistoryTable from '$lib/components/TradeHistoryTable.svelte';
	import PositionsTable from '$lib/components/PositionTable.svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { generatePageNumbers } from '$lib/helpers/PageHelpers';

	export let data: PageData;
	$: ({ positions = [], trades = [] } = data);
	let view = 'trades';

	const handlePageIncrement = () => {
		if (data.currentPage < data.totalPages) {
			handlePageRedirect(data.currentPage + 1);
		}
	};

	const handlePageDecrement = () => {
		if (data.currentPage > 1) {
			handlePageRedirect(data.currentPage - 1);
		}
	};

	const handlePageRedirect = (pageNumber: number) => {
		goto(`/trade/${pageNumber}`);
	};

	$: pageNumbers = generatePageNumbers(data.currentPage, data.totalPages);
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
	{#if data.totalPages > 0 && view === 'trades'}
		<div class="join mt-6 justify-center">
			<button
				class={`btn join-item ${data.currentPage === 1 ? 'btn-disabled' : ''}`}
				on:click={handlePageDecrement}>«</button
			>
			{#each pageNumbers as pageNum}
				{#if typeof pageNum === 'number'}
					<button
						class={`btn join-item ${pageNum === data.currentPage ? 'btn-active' : ''}`}
						on:click={() => handlePageRedirect(pageNum)}
					>
						{pageNum}
					</button>
				{:else}
					<button class="btn btn-disabled join-item">...</button>
				{/if}
			{/each}
			<button
				class={`btn join-item ${data.currentPage === data.totalPages ? 'btn-disabled' : ''}`}
				on:click={handlePageIncrement}>»</button
			>
		</div>
	{/if}
</div>
