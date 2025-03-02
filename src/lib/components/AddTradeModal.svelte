<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';

	import { dispatchToast } from '@/routes/stores';
	import { Currency, Platform, Region, TradeSide } from '../types';

	interface Props {
		isModalOpen?: boolean;
		handleCloseModal: () => void;
	}

	let { isModalOpen = false, handleCloseModal }: Props = $props();

	let modal: HTMLDialogElement | undefined = $state();

	let ticker: string = $state('');
	let region: string = $state('US');
	let currency: string = $state('USD');
	let price: number = $state(0);
	let fees: number = $state(0);
	let volume: number = $state(0);
	let platform: string = $state('FUTU');
	let side: string = $state('BUY');
	let executedAt: string = $state(new Date().toISOString().split('T')[0]);

	let addAnother: boolean = $state(true);

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
	let isFormValid = $derived(ticker && region && currency && price && volume && platform && side);
</script>

<dialog id="add-trade-modal" class="modal" bind:this={modal}>
	<div class="modal-box">
		<h3 class="text-lg font-bold" data-testid="add-trade-modal-title">Add new trade(s)</h3>
		<p class="py-4">Enter the details of the new trade:</p>
		<form
			onsubmit={(e) => e.preventDefault()}
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
					data-testid="add-trade-modal-ticker-input"
				/>
				<div class="label">
					<span class="label-text">Region</span>
				</div>
				<select
					class="select select-bordered w-full"
					bind:value={region}
					name="region"
					required
					data-testid="add-trade-modal-region-input"
				>
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
					data-testid="add-trade-modal-currency-input"
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
					data-testid="add-trade-modal-price-input"
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
					data-testid="add-trade-modal-fees-input"
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
					data-testid="add-trade-modal-volume-input"
				/>
				<div class="label">
					<span class="label-text">Platform</span>
				</div>
				<select
					class="select select-bordered w-full"
					bind:value={platform}
					name="platform"
					required
					data-testid="add-trade-modal-platform-input"
				>
					{#each Object.values(Platform) as platform}
						<option value={platform}>{platform}</option>
					{/each}
				</select>
				<div class="label">
					<span class="label-text">Side</span>
				</div>
				<select
					class="select select-bordered w-full"
					bind:value={side}
					name="side"
					required
					data-testid="add-trade-modal-side-input"
				>
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
					data-testid="add-trade-modal-executedAt-input"
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
							data-testid="add-trade-modal-add-another-input"
						/>
					</label>
				</div>
				<div class="modal-action">
					<button
						class="btn"
						type="button"
						onclick={handleCloseModal}
						data-testid="add-trade-modal-close-button">Close</button
					>
					<button
						class="btn btn-primary"
						type="submit"
						disabled={!isFormValid}
						data-testid="add-trade-modal-add-button">Add</button
					>
				</div>
			</div>
		</form>
	</div>
	<div class="modal-backdrop">
		<button type="button" onclick={handleCloseModal} style="pointer-events: none;">close</button>
	</div>
</dialog>

å
