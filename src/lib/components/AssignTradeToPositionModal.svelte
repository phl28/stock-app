<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	import { dispatchToast } from '@/routes/stores';
	import type { Position, Trade } from '../types/tradeTypes';

	interface Props {
		isModalOpen?: boolean;
		selectedTrades?: Trade[];
		positionId?: number | 'newPosition' | undefined;
		possiblePositions?: Position[];
		handleCloseModal: () => void;
		onAssigned: () => void;
	}

	let {
		isModalOpen = false,
		selectedTrades = [],
		positionId = undefined,
		possiblePositions = [],
		handleCloseModal,
		onAssigned
	}: Props = $props();

	let modal: HTMLDialogElement | undefined = $state();

	$effect(() => {
		(async () => {
			await tick();
			if (modal) {
				if (isModalOpen && !modal.open) {
					modal.showModal();
				} else if (!isModalOpen && modal.open) {
					modal.close();
				}
			}
		})();
	});

	let localSelectedTrades = $derived(selectedTrades);

	let isShort: boolean = $state(false);
	let tradeIds = $derived(JSON.stringify(localSelectedTrades.map((trade) => trade.id)));
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
						await update();
						await invalidateAll();
						onAssigned();
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
							onchange={() => (isShort = !isShort)}
							data-testid="assign-position-modal-short-toggle"
						/>
					</label>
				</div>
				<div class="modal-action">
					<button class="btn" type="button" onclick={handleCloseModal}>Close</button>
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
		<button type="button" onclick={handleCloseModal} style="pointer-events: none;">close</button>
	</div>
</dialog>
