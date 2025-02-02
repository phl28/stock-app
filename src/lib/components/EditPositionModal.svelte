<script lang="ts">
	import { enhance } from '$app/forms';
	import { darkTheme, dispatchToast } from '@/routes/stores';
	import type { Position, Trade } from '$lib/types/tradeTypes';
	import Grid from './Grid.svelte';
	import { formatDuration } from '../helpers/DataHelpers';
	import { formatCurrency } from '../helpers/CurrencyHelpers';
	import type { GridApi, GridOptions } from 'ag-grid-community';
	import { TradeSideCellRenderer } from './TradeSideCellRenderer';
	import { DateTimeEditor } from './DateTimeEditor';
	import { tick } from 'svelte';

	type PartialTrade = Pick<Trade, 'id' | 'executedAt' | 'price' | 'fees' | 'volume' | 'tradeSide'>;

	export let isModalOpen: boolean = false;
	export let position: Position;
	export let trades: PartialTrade[];
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

	let gridApi: GridApi;
	const handleGridReady = (event: CustomEvent) => {
		const api = event.detail;
		gridApi = api;
	};

	const gridOptions: GridOptions<PartialTrade> = {
		suppressMovableColumns: true,
		defaultColDef: {
			cellStyle: { fontSize: '12px !important' },
			editable: true
		},
		autoSizeStrategy: {
			type: 'fitGridWidth'
		},
		columnDefs: [
			{
				field: 'executedAt',
				headerName: 'Date',
				valueFormatter: ({ value }) => {
					const date = new Date(value);
					return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
				},
				minWidth: 170,
				cellEditor: DateTimeEditor
			},
			{
				field: 'tradeSide',
				headerName: 'Direction',
				cellRenderer: TradeSideCellRenderer,
				cellEditor: 'agSelectCellEditor',
				cellEditorParams: {
					values: ['BUY', 'SELL']
				}
			},
			{
				field: 'volume',
				headerName: 'Quantity',
				cellEditor: 'agNumberCellEditor',
				cellEditorParams: {
					min: 1
				}
			},
			{
				field: 'price',
				headerName: 'Price',
				valueFormatter: ({ value }) => formatCurrency(value, 'USD'),
				cellEditor: 'agNumberCellEditor',
				cellEditorParams: {
					min: 0
				}
			},
			{
				field: 'fees',
				headerName: 'Fees',
				valueFormatter: ({ value }) => formatCurrency(value, 'USD'),
				cellEditor: 'agNumberCellEditor',
				cellEditorParams: {
					min: 0
				}
			}
		]
	};

	$: {
		if (gridApi) {
			gridApi.setGridOption('rowData', trades);
		}
	}
</script>

<dialog id="editPositionModal" class="modal" bind:this={modal}>
	<div class="modal-box max-w-5xl">
		<h3 class="text-lg font-bold">Edit Position</h3>
		<div class="flex justify-between">
			<div class="flex flex-grow flex-col">
				<div class="flex">
					<label class="label flex cursor-pointer flex-col items-start gap-1">
						<span class="label-text">Ticker</span>
						<input
							id="ticker"
							type="text"
							disabled
							class="input input-bordered w-full"
							value={position.ticker}
						/>
					</label>
					<label class="label flex cursor-pointer flex-col items-start gap-1">
						<span class="label-text">Platform</span>
						<input
							id="ticker"
							type="text"
							disabled
							class="input input-bordered w-full"
							value={position.platform}
						/>
					</label>
				</div>
				<div class="overflow-x-auto">
					<Grid
						style="height: 250px"
						{gridOptions}
						isDarkMode={$darkTheme}
						on:gridReady={handleGridReady}
					/>
				</div>
			</div>
			<div class="divider divider-horizontal"></div>
			<div class="flex flex-col">
				<h4>Position Details</h4>
				<p>Direction: {position?.isShort ? 'Short' : 'Long'}</p>
				<p>Total Quantity: {position?.totalVolume}</p>
				<p>Outstanding Quantity: {position?.outstandingVolume}</p>
				<p>Gross P/L: {position?.grossProfitLoss}</p>
				<p>
					Net P/L: {Number(position?.grossProfitLoss) - Number(position?.totalFees)}
				</p>
				<p>Average Entry Price: {position?.averageEntryPrice}</p>
				<p>Average Exit Price: {position?.averageExitPrice}</p>
				<p>
					Duration: {formatDuration(
						new Date(trades?.at(0)?.executedAt ?? ''),
						new Date(trades?.at(-1)?.executedAt ?? '')
					)}
				</p>
			</div>
		</div>
		<div class="modal-action">
			<button class="btn" type="button" on:click={handleCloseModal}>Close</button>
			<button class="btn btn-primary" type="submit">Save</button>
		</div>
	</div>
	<div class="modal-backdrop">
		<button type="button" on:click={handleCloseModal}>close</button>
	</div>
</dialog>
