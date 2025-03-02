<script lang="ts">
	import { tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	import { dispatchToast } from '@/routes/stores';

	import Papa, { type ParseResult } from 'papaparse';
	import type { Trade } from '../types';

	export let isModalOpen: boolean = false;
	export let handleCloseModal: () => void;

	type CSVRow = {
		[key: string]: string | number | Date;
	};

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

	let headers: string[] = [];
	let headerMapping: { [key: string]: string } = {};
	let file: File | null = null;
	let importStep: number = 0;
	let parsedData: CSVRow[] = [];

	type ImportState = 'idle' | 'pending' | 'resolved' | 'rejected';
	let importState: ImportState = 'idle';

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

	// const requiredHeaders = expectedHeaders
	// 	.filter((header) => header.required)
	// 	.map((header) => header.value);

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

		Papa.parse<CSVRow>(file, {
			complete: (results: ParseResult<CSVRow>) => {
				// @FIXME type is temporary here
				parsedData = results.data;
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
			error: (error: Error) => {
				// @FIXME type is temporary here
				dispatchToast({ type: 'error', message: error.message });
			},
			header: true
		});
	};

	const importTrades = async () => {
		importState = 'pending';
		const mappedTrades = parsedData.map((row) => {
			if (!row) return;
			const mappedRow: Partial<Trade> = {
				region: 'US',
				currency: 'USD',
				platform: 'FUTU',
				fees: ''
			};
			Object.entries(headerMapping).forEach(([csvHeader, requiredHeader]) => {
				if (requiredHeader === '') return;
				if (requiredHeader === 'executedAt') {
					mappedRow.executedAt = new Date(row[csvHeader]);
				} else if (requiredHeader === 'tradeSide') {
					mappedRow.tradeSide = row[csvHeader].toString()?.toLowerCase().includes('buy')
						? 'BUY'
						: 'SELL';
				} else if (requiredHeader === 'volume') {
					mappedRow[requiredHeader] = parseFloat(row[csvHeader].toString());
				} else {
					const value = row[csvHeader];
					if (typeof value === 'string' || typeof value === 'number') {
						(mappedRow as any)[requiredHeader] = value;
					}
				}
			});
			if (mappedRow.fees === '') mappedRow.fees = '0';
			if (!mappedRow.ticker || mappedRow.ticker.trim() === '') {
				return;
			}
			return mappedRow;
		});
		try {
			const response = await fetch('/trade/bulk-insert', {
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
			handleCloseModal();
			importState = 'idle';
		}
	};
</script>

<dialog id="import-trade-modal" class="modal" bind:this={modal}>
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
					<button class="btn" on:click={handleCloseModal}>Close</button>
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
					<button class="btn btn-primary" on:click={importTrades} disabled={importState !== 'idle'}>
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
	<div class="modal-backdrop">
		<button on:click={handleCloseModal} style="pointer-events: none;">close</button>
	</div>
</dialog>
