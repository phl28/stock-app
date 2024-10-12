<script lang="ts">
	import { enhance } from '$app/forms';
	import { TradeSide, Platform, Region, Currency } from '$lib/types/tradeTypes';
	import type { Trade } from '$lib/types/tradeTypes';
	import { replacer } from '$lib/helpers/JsonHelpers';
	import { dispatchToast } from '../../routes/stores';

	export let selectedTrades: Map<number, Trade> = new Map();
	export let hasEditedNotes: boolean;

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

	const openModal = () => {
		const modal = document.getElementById('add-trade-modal') as HTMLDialogElement;
		modal.showModal();
	};

	const closeModal = () => {
		const modal = document.getElementById('add-trade-modal') as HTMLDialogElement;
		modal.close();
	};
</script>

<div class="m-2 flex flex-row items-center justify-between">
	<h5>Trade History</h5>
	<div class="flex justify-end space-x-2">
		{#if selectedTrades.size > 0}
			<form
				action="?/deleteTradesBatch"
				method="POST"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							selectedTrades.clear();
							selectedTrades = selectedTrades;
							dispatchToast({ type: 'success', message: 'Trades deleted successfully!' });
							await update();
						} else if (result.type === 'error') {
							dispatchToast({ type: 'error', message: result.error.message });
						}
					};
				}}
			>
				{#each selectedTrades.entries() as [id, _]}
					<input type="hidden" name="id" value={id} />
				{/each}
				<button class="btn btn-neutral" type="submit">Delete</button>
			</form>
			{#if hasEditedNotes}
				<form
					action="?/updateTradeBatch"
					method="POST"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								selectedTrades.clear();
								selectedTrades = selectedTrades;
								dispatchToast({ type: 'success', message: 'Trade updated successfully!' });
								await update();
							} else if (result.type === 'error') {
								dispatchToast({ type: 'error', message: result.error.message });
							}
						};
					}}
				>
					<input type="hidden" name="trades" value={JSON.stringify(selectedTrades, replacer)} />
					<button class="btn btn-primary" type="submit">Save</button>
				</form>
			{/if}
		{/if}
		<button class="btn btn-neutral" on:click={openModal}>Add Trade</button>
		<form method="POST" action="?/syncTrades">
			<button class="btn btn-neutral" type="submit">Sync Trades</button>
		</form>

		<dialog id="add-trade-modal" class="modal">
			<div class="modal-box">
				<h3 class="text-lg font-bold">Add new trade</h3>
				<p class="py-4">Enter the details of the new trade:</p>
				<form
					method="POST"
					action="?/addTrade"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								dispatchToast({ type: 'success', message: 'Trade added successfully!' });
								await update();
								if (!addAnother) {
									closeModal();
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
						<select
							class="select select-bordered w-full"
							bind:value={region}
							name="region"
							required
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
									checked={addAnother}
									on:change={() => (addAnother = !addAnother)}
								/>
							</label>
						</div>
						<div class="modal-action">
							<form method="dialog">
								<button class="btn">Close</button>
							</form>
							<button class="btn btn-primary" type="submit" disabled={!isFormValid}>Add</button>
						</div>
					</div>
				</form>
			</div>
		</dialog>
	</div>
</div>
