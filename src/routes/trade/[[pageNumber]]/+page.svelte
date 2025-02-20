<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	import TradeHistoryTable from '$lib/components/TradeHistoryTable.svelte';
	import PositionTable from '$lib/components/PositionTable.svelte';
	import { generatePageNumbers } from '$lib/helpers/PageHelpers';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { positions = [], trades = [] } = $derived(data);
	let view = $state('positions');

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

	let pageNumbers = $derived(generatePageNumbers(data.currentPage, data.totalPages));
</script>

<svelte:head>
	<title>Trade History & Positions</title>
	<meta name="description" content="View and manage your trading history and active positions." />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8">
	<div class="mb-8">
		<h1 class="text-center">Trade Management</h1>
		<p class="mt-2 text-center text-base-content/60">
			Track your trading history and manage your positions
		</p>
	</div>

	<div class="card bg-base-100 p-6 shadow-lg">
		<div class="mb-6">
			<select class="select select-bordered w-full max-w-xs" bind:value={view}>
				<option value="positions">Positions</option>
				<option value="trades">Trades</option>
			</select>
		</div>

		{#if view === 'trades'}
			<TradeHistoryTable {trades} {positions} />
		{:else if view === 'positions'}
			<PositionTable {positions} />
		{/if}

		{#if data.totalPages > 0 && view === 'trades'}
			<div class="mt-8 flex justify-center">
				<div class="join">
					<button
						class={`btn join-item ${data.currentPage === 1 ? 'btn-disabled' : ''}`}
						onclick={handlePageDecrement}>«</button
					>
					{#each pageNumbers as pageNum}
						{#if typeof pageNum === 'number'}
							<button
								class={`btn join-item ${pageNum === data.currentPage ? 'btn-active' : ''}`}
								onclick={() => handlePageRedirect(pageNum)}
							>
								{pageNum}
							</button>
						{:else}
							<button class="btn btn-disabled join-item">...</button>
						{/if}
					{/each}
					<button
						class={`btn join-item ${data.currentPage === data.totalPages ? 'btn-disabled' : ''}`}
						onclick={handlePageIncrement}>»</button
					>
				</div>
			</div>
		{/if}
	</div>
</div>
