<script lang="ts">
	import { enhance } from '$app/forms';
	import { TradeSide, Platform, Region, Currency } from '$lib/types/tradeTypes';

	export let selectedTrades: Set<number> = new Set();
	let ticker: string = 'AAPL';
	let region: Region = Region.US;
	let currency: Currency = Currency.USD;
	let price: number = 100;
	let fees: number = 1;
	let volume: number = 1000;
	let platform: Platform = Platform.FUTU;
	let side: TradeSide = TradeSide.BUY;
	let executedAt: string = '2023-10-01';
	let notes: string = '';

	function openModal() {
		const modal = document.getElementById('add-trade-modal') as HTMLDialogElement;
		modal.showModal();
	}

	function closeModal() {
		const modal = document.getElementById('add-trade-modal') as HTMLDialogElement;
		modal.close();
	}
</script>

<div class="m-4 flex justify-end">
	{#if selectedTrades.size > 0}
		<form
			action="?/deleteTradesBatch"
			method="POST"
			use:enhance={({ formElement, formData, action, cancel }) => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						selectedTrades.clear();
						selectedTrades = selectedTrades;
						await update();
					}
				};
			}}
		>
			{#each Array.from(selectedTrades) as id}
				<input type="hidden" name="id" value={id} />
			{/each}
			<button class="btn btn-neutral" type="submit">Delete</button>
		</form>
	{/if}
	<button class="btn btn-neutral" on:click={openModal}>Add new trade</button>
	<dialog id="add-trade-modal" class="modal">
		<div class="modal-box">
			<h3 class="text-lg font-bold">Add new trade</h3>
			<p class="py-4">Enter the details of the new trade:</p>
			<form method="POST" action="?/addTrade" use:enhance>
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
					/>
					<div class="label">
						<span class="label-text">Region</span>
					</div>
					<select class="select select-bordered w-full" bind:value={region} name="region">
						{#each Object.values(Region) as region}
							<option value={region}>{region}</option>
						{/each}
					</select>
					<div class="label">
						<span class="label-text">Currency</span>
					</div>
					<select class="select select-bordered w-full" bind:value={currency} name="currency">
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
					/>
					<div class="label">
						<span class="label-text">Fees</span>
					</div>
					<input
						type="number"
						placeholder="1"
						class="input input-bordered w-full"
						bind:value={fees}
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
					/>
					<div class="label">
						<span class="label-text">Platform</span>
					</div>
					<select class="select select-bordered w-full" bind:value={platform} name="platform">
						{#each Object.values(Platform) as platform}
							<option value={platform}>{platform}</option>
						{/each}
					</select>
					<div class="label">
						<span class="label-text">Side</span>
					</div>
					<select class="select select-bordered w-full" bind:value={side} name="side">
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
					<div class="label">
						<span class="label-text">Notes</span>
					</div>
					<textarea
						class="textarea textarea-bordered"
						placeholder="Notes"
						bind:value={notes}
						name="notes"
					></textarea>
				</div>
				<div class="modal-action">
					<form method="dialog">
						<button class="btn">Close</button>
					</form>
					<button class="btn btn-primary" type="submit" on:click={closeModal}>Add</button>
				</div>
			</form>
		</div>
	</dialog>
</div>
