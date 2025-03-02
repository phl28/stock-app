<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
	import { enhance } from '$app/forms';

	import { dispatchToast } from '@/routes/stores';
	import type { Position, Trade } from '../types/tradeTypes';

	const dispatch = createEventDispatcher();

	export let isModalOpen: boolean = false;
	export let selectedTrades: Trade[] = [];
	export let positionId: number | 'newPosition' | undefined = undefined;
	export let possiblePositions: Position[] = [];
	export let handleCloseModal: () => void;

	let modal: HTMLDialogElement;

	$: (async () => {
		await tick();
		if (modal) {
			if (isModalOpen && !modal.open) {
				modal.showModal();
			} else if (!isModalOpen && modal.open) {
				modal.close();
			}
		}
	})();

	$: localSelectedTrades = selectedTrades;

	let isShort: boolean = false;
	$: tradeIds = JSON.stringify(localSelectedTrades.map((trade) => trade.id));
</script>

<dialog id="assign-position-modal" class="modal" bind:this={modal}>
	<div class="modal-box">
		<h3 class="mb-2 text-lg font-bold" data-testid="assign-position-modal-title">
			Assign the selected trades to a position
		</h3>
		<form
			method="POST"
			action="?/assignTradesToPosition"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						dispatchToast({
							type: 'success',
							message: 'Trades assigned to position successfully!'
						});
						selectedTrades = [];
						await update();
						dispatch('assigned');
					} else if (result.type === 'error') {
						dispatchToast({ type: 'error', message: result.error.message });
					}
					handleCloseModal();
				};
			}}
		>
			<select
				class="select select-bordered select-sm w-full"
				bind:value={positionId}
				name="positionId"
				data-testid="assign-position-modal-position-select"
			>
				<option disabled selected value={undefined}
					>Select the position to assign these trades to?</option
				>
				{#each possiblePositions as position}
					<option value={position.id}
						>({position.isShort ? 'Short' : 'Long'}) {position.ticker} Opened At: {position.openedAt}</option
					>
				{/each}
				<option value="newPosition">Assign to new position</option>
			</select>
			<div class="form-control w-full">
				<input type="hidden" name="tradeIds" value={tradeIds} />
				<div class={positionId === 'newPosition' ? 'form-control' : 'hidden'}>
					<label class="label cursor-pointer">
						<span class="label-text">Short Position</span>
						<input
							type="checkbox"
							class="toggle"
							checked={isShort}
							name="isShort"
							on:change={() => (isShort = !isShort)}
							data-testid="assign-position-modal-short-toggle"
						/>
					</label>
				</div>
				<div class="modal-action">
					<button class="btn" type="button" on:click={handleCloseModal}>Close</button>
					<button
						class="btn btn-primary"
						type="submit"
						disabled={positionId === undefined}
						data-testid="assign-position-modal-add-button"
					>
						>Add</button
					>
				</div>
			</div>
		</form>
	</div>
	<div class="modal-backdrop">
		<button type="button" on:click={handleCloseModal}>close</button>
	</div>
</dialog>
