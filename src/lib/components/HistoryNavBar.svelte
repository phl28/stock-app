<script lang="ts">
	import { enhance } from '$app/forms';
	import { TradeSide, Platform, Region, Currency } from '$lib/types/tradeTypes';
	import type { Trade } from '$lib/types/tradeTypes';
	import { replacer } from '$lib/helpers/jsonHelpers';
	import { dispatchToast } from '@/routes/stores';
	import Papa from 'papaparse';
	import { invalidateAll } from '$app/navigation';

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

	const openAddModal = () => {
		const modal = document.getElementById('add-trade-modal') as HTMLDialogElement;
		modal.showModal();
	};

	const closeAddModal = () => {
		const modal = document.getElementById('add-trade-modal') as HTMLDialogElement;
		modal.close();
	};

	const expectedHeaders = [
		{ label: 'Ticker', value: 'ticker', required: true, similar: ['symbol'] },
		{ label: 'Region', value: 'region', required: true, similar: [] },
		{ label: 'Currency', value: 'currency', required: true, similar: [] },
		{ label: 'Price', value: 'price', required: true, similar: [] },
		{ label: 'Fees', value: 'fees', required: false, similar: [] },
		{ label: 'Total Cost', value: 'totalCost', required: true, similar: ['amount'] },
		{ label: 'Volume', value: 'volume', required: true, similar: ['qty'] },
		{ label: 'Platform', value: 'platform', required: true, similar: [] },
		{ label: 'Trade Side', value: 'tradeSide', required: true, similar: ['direction'] },
		{ label: 'Executed At', value: 'executedAt', required: true, similar: ['fill time'] }
	];

	const requiredHeaders = expectedHeaders
		.filter((header) => header.required)
		.map((header) => header.value);

	let headers: string[] = [];
	let headerMapping: { [key: string]: string } = {};
	let file: File | null = null;
	let importStep: number = 0;
	let parsedData: { [key: string]: any }[] = [];

	const handleFileUpload = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			file = target.files[0];
		}
	};

	const parseCsv = () => {
		if (!file) {
			dispatchToast({ type: 'error', message: 'Please select a file first.' });
			return;
		}

		Papa.parse(file, {
			complete: (results: any) => {
				// @FIXME type is temporary here
				parsedData = results.data as { [key: string]: any }[];
				headers = results.meta.fields ?? [];
				headerMapping = {};
				headers.forEach((header) => {
					const match = expectedHeaders.find(
						(eh) =>
							eh.similar.some(
								(similarHeader) =>
									similarHeader.toLowerCase().includes(header.toLowerCase()) ||
									(similarHeader !== '' &&
										header.toLowerCase().includes(similarHeader.toLowerCase()))
							) || header.toLowerCase().includes(eh.value.toLowerCase())
					);
					if (match) {
						headerMapping[header] = match.value;
					}
				});
				importStep = 1;
			},
			error: (error: any) => {
				// @FIXME type is temporary here
				dispatchToast({ type: 'error', message: error.message });
			},
			header: true
		});
	};

	type ImportState = 'idle' | 'pending' | 'resolved' | 'rejected';
	let importState: ImportState = 'idle';

	const importTrades = async () => {
		importState = 'pending';
		const mappedTrades = parsedData.map((row) => {
			if (!row) return;
			const mappedRow: { [key: string]: any } = {
				region: 'US',
				currency: 'USD',
				platform: 'FUTU',
				fees: '',
				profitLoss: null
			};
			Object.entries(headerMapping).forEach(([csvHeader, requiredHeader]) => {
				if (requiredHeader === '') return;
				if (requiredHeader === 'executedAt') {
					mappedRow.executedAt = new Date(row[csvHeader]);
				} else if (requiredHeader === 'tradeSide') {
					mappedRow.tradeSide = row[csvHeader]?.toLowerCase().includes('buy') ? 'BUY' : 'SELL';
				} else if (requiredHeader === 'volume') {
					mappedRow[requiredHeader] = parseFloat(row[csvHeader]);
				} else {
					mappedRow[requiredHeader] = row[csvHeader];
				}
			});
			if (mappedRow.fees === '') mappedRow.fees = '0';
			if (!mappedRow.ticker || mappedRow.ticker.trim() === '') {
				return;
			}
			return mappedRow;
		});
		try {
			const response = await fetch('/trade', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ trades: mappedTrades })
			});

			if (!response.ok) {
				throw new Error('Failed to import trades');
			}
			dispatchToast({ type: 'success', message: 'Trades imported successfully!' });
			importState = 'resolved';
			await invalidateAll();
		} catch (error) {
			dispatchToast({
				type: 'error',
				message: (error as Error).message || 'Failed to import trades.'
			});
			importState = 'rejected';
		} finally {
			closeImportModal();
		}
	};

	const openImportModal = () => {
		importStep = 0;
		file = null;
		parsedData = [];
		headers = [];
		headerMapping = {};
		const modal = document.getElementById('import-trade-modal') as HTMLDialogElement;
		modal.showModal();
	};

	const closeImportModal = () => {
		const modal = document.getElementById('import-trade-modal') as HTMLDialogElement;
		modal.close();
		importState = 'idle';
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
		<button class="btn btn-neutral" on:click={openAddModal}>Add</button>
		<button class="btn btn-neutral" on:click={openImportModal}>Bulk Import</button>
		<form method="POST" action="?/syncTrades">
			<button class="btn btn-neutral" type="submit">Sync</button>
		</form>

		<dialog id="import-trade-modal" class="modal">
			<div class="modal-box">
				<h3 class="mb-6 text-lg font-bold">Import trades</h3>
				{#if importStep === 0}
					<div>
						<input
							type="file"
							class="file-input file-input-bordered w-full max-w-xs"
							accept=".csv"
							on:change={handleFileUpload}
							required
						/>
						<div class="modal-action">
							<button class="btn" on:click={closeImportModal}>Close</button>
							<button class="btn btn-primary" on:click={parseCsv} disabled={!file}>Next</button>
						</div>
					</div>
				{:else if importStep === 1}
					<div>
						<h4 class="mb-4">Map CSV headers to required import headers:</h4>
						{#each headers as header}
							<div class="mb-2 flex flex-row items-center justify-between">
								<span>{header}: </span>
								<select
									class="select select-bordered w-full max-w-xs"
									bind:value={headerMapping[header]}
								>
									<option value="">-- Select --</option>
									{#each expectedHeaders as { label, value }}
										<option {value}>{label}</option>
									{/each}
								</select>
							</div>
						{/each}
						<div class="modal-action">
							<button class="btn" on:click={() => (importStep = 0)}>Back</button>
							<button
								class="btn btn-primary"
								on:click={importTrades}
								disabled={importState !== 'idle'}
							>
								{#if importState === 'idle'}
									Import
								{:else if importState === 'pending'}
									<span class="loading loading-spinner loading-sm"></span>
									Importing...
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>
		</dialog>

		<dialog id="add-trade-modal" class="modal">
			<div class="modal-box">
				<h3 class="text-lg font-bold">Add new trade(s)</h3>
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
									closeAddModal();
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
