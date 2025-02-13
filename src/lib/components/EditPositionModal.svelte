<script lang="ts">
	import { tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { darkTheme, dispatchToast } from '@/routes/stores';

	import type { Position, Trade } from '$lib/types/tradeTypes';
	import Grid from './Grid.svelte';
	import { formatDuration } from '../helpers/DataHelpers';
	import { formatCurrency } from '../helpers/CurrencyHelpers';
	import { TradeSideCellRenderer } from './TradeSideCellRenderer';
	import { DateTimeEditor } from './DateTimeEditor';

	import type {
		CellValueChangedEvent,
		GridApi,
		GridOptions,
		RowSelectedEvent
	} from 'ag-grid-community';
	import { ArrowDown, ArrowUp } from 'lucide-svelte';

	type PartialTrade = Pick<Trade, 'id' | 'executedAt' | 'price' | 'fees' | 'volume' | 'tradeSide'>;

	export let isModalOpen: boolean = false;
	export let position: Position;
	export let trades: PartialTrade[];
	export let handleCloseModal: () => void;

	let modal: HTMLDialogElement;
	let gridApi: GridApi<PartialTrade>;
	let gridData: PartialTrade[] = [];
	let selectedRows: PartialTrade[] = [];
	let isEdited: boolean = false;
	$: (async () => {
		await tick();
		if (modal) {
			if (isModalOpen && !modal.open) {
				modal.showModal();
				gridData = trades.map((t) => ({ ...t }));
				if (gridApi) gridApi.setGridOption('rowData', gridData);
			} else if (!isModalOpen && modal.open) {
				modal.close();
			}
		}
	})();

	const handleGridReady = (event: CustomEvent) => {
		gridApi = event.detail;
		gridApi.setGridOption('rowData', gridData);
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
		rowSelection: {
			mode: 'multiRow'
		},
		onRowSelected: (event: RowSelectedEvent) => {
			const api = event.api;
			selectedRows = api.getSelectedRows();
		},
		onCellValueChanged: (event: CellValueChangedEvent) => {
			isEdited = JSON.stringify(gridData) !== JSON.stringify(trades);
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
				cellEditor: DateTimeEditor,
				cellEditorPopup: true,
				cellEditorPopupPosition: 'under'
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
				cellEditor: 'agTextCellEditor',
				cellEditorParams: {
					min: 0
				}
			},
			{
				field: 'fees',
				headerName: 'Fees',
				valueFormatter: ({ value }) => formatCurrency(value, 'USD'),
				cellEditor: 'agTextCellEditor',
				cellEditorParams: {
					min: 0
				}
			}
		]
	};

	$: {
		if (gridApi) {
			gridApi.setGridOption('rowData', gridData);
		}
	}

	const resetGridData = () => {
		gridData = trades.map((t) => ({ ...t }));
		if (gridApi) gridApi.setGridOption('rowData', gridData);
	};

	const onClose = () => {
		resetGridData();
		handleCloseModal();
	};

	const handleUpdateTrades = async () => {
		const allTrades: PartialTrade[] = [];
		gridApi.forEachNode((node) => {
			if (node.data) {
				allTrades.push(node.data);
			}
		});

		const response = await fetch(`/trade/bulk-update`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ trades: allTrades, positionId: position.id })
		});

		if (response.ok) {
			dispatchToast({ type: 'success', message: 'Trades updated successfully!' });
		} else {
			dispatchToast({ type: 'error', message: 'Failed to update trades' });
		}

		await invalidateAll();
		onClose();
	};

	const addNewRow = async () => {
		try {
			let newTrade: Partial<Trade> = {
				positionId: position.id,
				ticker: position.ticker,
				region: position.region,
				currency: position.currency,
				platform: position.platform,
				executedAt: new Date(),
				price: '0',
				fees: '0',
				volume: 0,
				tradeSide: 'BUY'
			};
			const response = await fetch('/trade/bulk-insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ trades: [newTrade] })
			});
			if (!response.ok) {
				throw new Error('Failed to add trade');
			}
			const { trades: newTrades } = await response.json();
			gridData = [...gridData, ...newTrades];
			gridApi.setGridOption('rowData', gridData);
			await invalidateAll();
		} catch (error) {
			dispatchToast({ type: 'error', message: 'Failed to add trade' });
		}
	};

	const deleteSelectedRows = async () => {
		try {
			const selectedNodes = gridApi.getSelectedNodes();
			const selectedIds = selectedNodes.map((node) => node.data?.id);
			const response = await fetch('/trade/bulk-delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ ids: selectedIds })
			});
			gridData = gridData.filter((row) => !selectedIds.includes(row.id));
			gridApi.setGridOption('rowData', gridData);
			await invalidateAll();
		} catch (err) {
			dispatchToast({ type: 'error', message: 'Failed to delete trades' });
		}
	};
</script>

<dialog id="editPositionModal" class="modal" bind:this={modal}>
	<div class="modal-box max-w-5xl">
		<h3 class="text-lg font-bold">Edit Position</h3>
		<div class="flex justify-between">
			<div class="flex flex-grow-[3] flex-col">
				<div class="flex">
					<label class="label flex cursor-pointer flex-col items-start gap-1 pl-0">
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
				<div class="mt-4 overflow-x-auto">
					<div class="mb-4 flex gap-2">
						<button class="btn btn-success btn-sm" on:click={addNewRow}>Add Trade</button>
						<button
							class="btn btn-error btn-sm"
							on:click={deleteSelectedRows}
							disabled={selectedRows.length === 0}
						>
							Delete Selected
						</button>
					</div>
					<Grid
						style="height: 250px"
						{gridOptions}
						isDarkMode={$darkTheme}
						on:gridReady={handleGridReady}
					/>
				</div>
			</div>
			<div class="divider divider-horizontal"></div>
			<div class="flex flex-grow flex-col gap-1">
				<h4>Position Details</h4>
				<p class="flex items-center gap-2">
					Direction:
					<span
						class={`badge badge-md text-xs font-normal ${position?.isShort ? 'badge-error' : 'badge-success'}`}
					>
						{#if position?.isShort}
							<ArrowDown strokeWidth="1" size={20} />Short
						{:else}
							<ArrowUp strokeWidth="1" size={20} />Long
						{/if}
					</span>
				</p>
				<div class="flex items-center justify-between">
					<span class="text-sm opacity-75">Total Quantity</span>
					<span>{position?.totalVolume}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm opacity-75">Outstanding Quantity</span>
					<span>{position?.outstandingVolume}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm opacity-75">Gross P/L</span>
					<span>{Number(position?.grossProfitLoss).toFixed(2)}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm opacity-75">Net P/L</span>
					<span>{(Number(position?.grossProfitLoss) - Number(position?.totalFees)).toFixed(2)}</span
					>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm opacity-75">Average Entry Price</span>
					<span>{Number(position?.averageEntryPrice).toFixed(2)}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm opacity-75">Average Exit Price</span>
					<span>{Number(position?.averageExitPrice).toFixed(2)}</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-sm opacity-75">Duration</span>
					<span
						>{formatDuration(
							new Date(trades?.at(0)?.executedAt ?? ''),
							position.closedAt ? new Date(trades?.at(-1)?.executedAt ?? '') : new Date()
						)}</span
					>
				</div>
			</div>
		</div>
		<div class="modal-action">
			<button class="btn btn-warning" type="button" on:click={resetGridData} disabled={!isEdited}>
				Reset
			</button>
			<button class="btn btn-neutral" type="button" on:click={onClose}>Close</button>
			<button
				class="btn btn-primary"
				on:click={handleUpdateTrades}
				type="submit"
				disabled={!isEdited}
			>
				Save
			</button>
		</div>
	</div>
	<div class="modal-backdrop">
		<button type="button" on:click={onClose}>close</button>
	</div>
</dialog>
