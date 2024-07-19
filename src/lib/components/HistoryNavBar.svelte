<script lang="ts">
	import { TradeSide, Platform, Region, Currency } from '$lib/types/tradeTypes';
	let ticker: string = 'AAPL';
	let region: Region = Region.US;
	let currency: Currency = Currency.USD;
	let price: number = 100;
	let fees: number = 1;
	let totalValue: number = 1000;
	let volume: number = 1000;
	let platform: Platform = Platform.FUTU;
	let side: TradeSide = TradeSide.BUY;
	let executedAt: string = '2023-10-01';
	let notes: string = '';

	function openModal() {
		const modal = document.getElementById('add-trade-modal') as HTMLDialogElement;
		modal.showModal();
	}
</script>

<div class="m-4 flex justify-end">
	<button class="btn btn-neutral" on:click={openModal}>Add new trade</button>
	<dialog id="add-trade-modal" class="modal">
		<div class="modal-box">
			<h3 class="text-lg font-bold">Add new trade</h3>
			<p class="py-4">Enter the details of the new trade:</p>
			<div class="form-control w-full">
				<div class="label">
					<span class="label-text">Ticker</span>
				</div>
				<input
					type="text"
					placeholder="AAPL"
					class="input input-bordered w-full"
					bind:value={ticker}
				/>
				<div class="label">
					<span class="label-text">Region</span>
				</div>
				<select class="select select-bordered w-full" bind:value={region}>
					{#each Object.values(Region) as region}
						<option value={region}>{region}</option>
					{/each}
				</select>
				<div class="label">
					<span class="label-text">Currency</span>
				</div>
				<select class="select select-bordered w-full" bind:value={currency}>
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
				/>
				<div class="label">
					<span class="label-text">Fees</span>
				</div>
				<input
					type="number"
					placeholder="1"
					class="input input-bordered w-full"
					bind:value={fees}
				/>
				<div class="label">
					<span class="label-text">Volume</span>
				</div>
				<input
					type="number"
					placeholder="1000"
					class="input input-bordered w-full"
					bind:value={volume}
				/>
				<div class="label">
					<span class="label-text">Platform</span>
				</div>
				<select class="select select-bordered w-full" bind:value={platform}>
					{#each Object.values(Platform) as platform}
						<option value={platform}>{platform}</option>
					{/each}
				</select>
				<div class="label">
					<span class="label-text">Side</span>
				</div>
				<select class="select select-bordered w-full" bind:value={side}>
					{#each Object.values(TradeSide) as side}
						<option value={side}>{side}</option>
					{/each}
				</select>
				<div class="label">
					<span class="label-text">Executed At</span>
				</div>
				<input type="date" class="input input-bordered w-full" bind:value={executedAt} />
				<div class="label">
					<span class="label-text">Notes</span>
				</div>
				<textarea class="textarea textarea-bordered" placeholder="Notes" bind:value={notes}
				></textarea>
			</div>
			<div class="modal-action">
				<form method="dialog">
					<button class="btn">Close</button>
				</form>
			</div>
		</div>
	</dialog>
</div>
