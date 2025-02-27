<script lang="ts">
	import { enhance } from '$app/forms';

	import type { Trade, Position } from '$lib/types/tradeTypes';
	import { dispatchToast, modalStore } from '@/routes/stores';
	import AssignTradeToPositionModal from './AssignTradeToPositionModal.svelte';
	import ImportTradesModal from './ImportTradesModal.svelte';
	import AddTradeModal from './AddTradeModal.svelte';

	export let selectedTrades: Trade[] = [];
	export let numOfTrades: number = 0;
	export let positions: Position[] = [];

	let positionId: number | 'newPosition' | undefined = undefined;

	let selectedTickers: string[] = [];
	$: selectedTickers = Array.from(new Set(selectedTrades.map((trade) => trade.ticker)));

	$: possiblePositions = positions.filter((position) => position.ticker === selectedTickers[0]);

	const toggleAddTradeModal = () => {
		modalStore.toggleAddTradeModal();
	};

	const toggleAssignTradeModal = () => {
		modalStore.toggleAssignTradeModal();
	};

	const toggleImportTradeModal = () => {
		modalStore.toggleImportTradeModal();
	};
</script>

<div class="m-2 flex flex-row items-center justify-between">
	<h5>Trades ({numOfTrades})</h5>
	<div class="flex justify-end space-x-2">
		{#if selectedTrades.length > 0}
			<form
				action="?/deleteTradesBatch"
				method="POST"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							dispatchToast({ type: 'success', message: 'Trades deleted successfully!' });
							await update();
						} else if (result.type === 'error') {
							dispatchToast({ type: 'error', message: result.error.message });
						}
					};
				}}
			>
				{#each selectedTrades as trade}
					<input type="hidden" name="id" value={trade.id} />
				{/each}
				<button class="btn btn-error" type="submit">Delete</button>
			</form>
			{#if selectedTickers.length === 1}
				<button class="btn btn-primary" on:click={toggleAssignTradeModal}>Assign To Position</button
				>
			{/if}
		{/if}
		<button
			class="btn btn-neutral"
			on:click={toggleAddTradeModal}
			data-testid="navbar-add-trade-button">Add</button
		>
		<button class="btn btn-neutral" on:click={toggleImportTradeModal}>Bulk Import</button>
		<!-- @TODO: Hiding the sync button for now as it is not a priority and is yet to be implemented properly -->
		<!-- <form method="POST" action="?/syncTrades">
			<button class="btn btn-neutral" type="submit">Sync</button>
		</form> -->
		{#if $modalStore.assignTradeModal}
			<AssignTradeToPositionModal
				isModalOpen={$modalStore.assignTradeModal}
				bind:selectedTrades
				bind:positionId
				bind:possiblePositions
				handleCloseModal={toggleAssignTradeModal}
				on:assigned={() => {
					selectedTrades = [];
				}}
			/>
		{/if}
		{#if $modalStore.importTradeModal}
			<ImportTradesModal
				isModalOpen={$modalStore.importTradeModal}
				handleCloseModal={toggleImportTradeModal}
			/>
		{/if}
		{#if $modalStore.addTradeModal}
			<AddTradeModal
				isModalOpen={$modalStore.addTradeModal}
				handleCloseModal={toggleAddTradeModal}
			/>
		{/if}
	</div>
</div>
