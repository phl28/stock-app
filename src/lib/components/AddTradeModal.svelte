<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';

	import { dispatchToast } from '@/routes/stores';
	import { Currency, Platform, Region, TradeSide } from '../types';

	export let isModalOpen: boolean = false;
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

	$: isFormValid = ticker && region && currency && price && volume && platform && side;

	let ticker: string;
	let region: string;
	let currency: string;
	let price: number;
	let fees: number;
	let volume: number;
	let platform: string;
	let side: string;
	let executedAt: string = new Date().toISOString().split('T')[0];

	let addAnother: boolean = true;

	const resetForm = () => {
		ticker = '';
		region = 'US';
		currency = 'USD';
		price = 0;
		fees = 0;
		volume = 0;
		platform = 'FUTU';
		side = 'BUY';
		executedAt = new Date().toISOString().split('T')[0];
		addAnother = true;
	};
</script>

<dialog id="add-trade-modal" class="modal" bind:this={modal}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Add new trade(s)</h3>
		<p class="py-4">Enter the details of the new trade:</p>
		<form
			on:submit|preventDefault
			method="POST"
			action="?/addTrade"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						dispatchToast({ type: 'success', message: 'Trade added successfully!' });
						await update({ reset: false });
						if (!addAnother) {
							handleCloseModal();
						} else {
							resetForm();
						}
					} else if (result.type === 'error') {
						dispatchToast({ type: 'error', message: result.error.message });
					}
				};
			}}
		>
			<div class="form-control w-full">
				<div class="label">
					<span class="label-text">Ticker</span>
				</div>
				<input
					type="text"
					placeholder="AAPL"
					class="input input-bordered w-full"
					bind:value={ticker}
					name="ticker"
					required
				/>
				<div class="label">
					<span class="label-text">Region</span>
				</div>
				<select class="select select-bordered w-full" bind:value={region} name="region" required>
					{#each Object.values(Region) as region}
						<option value={region}>{region}</option>
					{/each}
				</select>
				<div class="label">
					<span class="label-text">Currency</span>
				</div>
				<select
					class="select select-bordered w-full"
					bind:value={currency}
					name="currency"
					required
				>
					{#each Object.values(Currency) as currency}
						<option value={currency}>{currency}</option>
					{/each}
				</select>
				<div class="label">
					<span class="label-text">Price</span>
				</div>
				<input
					type="number"
					placeholder="100"
					class="input input-bordered w-full"
					bind:value={price}
					name="price"
					step="0.01"
					required
				/>
				<div class="label">
					<span class="label-text">Fees</span>
				</div>
				<input
					type="number"
					placeholder="1"
					class="input input-bordered w-full"
					bind:value={fees}
					step="0.01"
					name="fees"
				/>
				<div class="label">
					<span class="label-text">Volume</span>
				</div>
				<input
					type="number"
					placeholder="1000"
					class="input input-bordered w-full"
					bind:value={volume}
					name="volume"
					required
				/>
				<div class="label">
					<span class="label-text">Platform</span>
				</div>
				<select
					class="select select-bordered w-full"
					bind:value={platform}
					name="platform"
					required
				>
					{#each Object.values(Platform) as platform}
						<option value={platform}>{platform}</option>
					{/each}
				</select>
				<div class="label">
					<span class="label-text">Side</span>
				</div>
				<select class="select select-bordered w-full" bind:value={side} name="side" required>
					{#each Object.values(TradeSide) as side}
						<option value={side}>{side}</option>
					{/each}
				</select>
				<div class="label">
					<span class="label-text">Executed At</span>
				</div>
				<input
					type="date"
					class="input input-bordered w-full"
					bind:value={executedAt}
					name="executedAt"
				/>
			</div>
			<div class="flex items-center justify-between">
				<div class="form-control">
					<label class="label mt-6 flex cursor-pointer gap-3">
						<span class="label-text">Add another</span>
						<input
							type="checkbox"
							class="toggle"
							bind:checked={addAnother}
							on:change={() => (addAnother = !addAnother)}
						/>
					</label>
				</div>
				<div class="modal-action">
					<button class="btn" type="button" on:click={handleCloseModal}>Close</button>
					<button class="btn btn-primary" type="submit" disabled={!isFormValid}>Add</button>
				</div>
			</div>
		</form>
	</div>
	<div class="modal-backdrop">
		<button type="button" on:click={handleCloseModal}>close</button>
	</div>
</dialog>
