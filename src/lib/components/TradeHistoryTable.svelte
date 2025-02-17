<script lang="ts">
	import { darkTheme } from '@/routes/stores';
	import Grid from './Grid.svelte';
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';

	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Trade, Position } from '$lib/types/tradeTypes';
	import { TradeSideCellRenderer } from './TradeSideCellRenderer';

	import type { GridOptions, GridApi } from 'ag-grid-community';

	export let trades: Trade[];
	export let positions: Position[];

	let selectedTrades = new Map<number, Trade>();
	let selectedAllUnassigned: boolean = false;

	const toggleSelection = (trade: Trade[]) => {
		selectedTrades = new Map(trade.map((t) => [t.id, t]));
		selectedTrades = selectedTrades;
	};

	let unassignedTrades: Trade[] = [];

	const toggleSelectAllUnassigned = () => {
		if (selectedAllUnassigned) {
			selectedTrades = new Map();
		} else {
			selectedTrades = new Map(unassignedTrades.map((trade) => [trade.id, trade]));
		}
		selectedAllUnassigned = !selectedAllUnassigned;
	};

	$: {
		unassignedTrades = [];
		for (const trade of trades) {
			if (!trade.positionId) {
				unassignedTrades = [...unassignedTrades, trade];
			}
		}
	}

	const gridOptions: GridOptions<Trade> = {
		rowSelection: {
			mode: 'multiRow'
		},
		suppressMovableColumns: true,
		suppressCellFocus: true,
		defaultColDef: {
			cellStyle: {
				display: 'flex',
				justifyContent: 'flex-start',
				alignItems: 'center',
				cursor: 'pointer',
				padding: '0.75rem 1rem',
				fontSize: '0.875rem',
				fontFamily: 'var(--font-sans)',
				transition: 'background-color 0.2s'
			},
			sortable: true,
			resizable: true
		},
		autoSizeStrategy: {
			type: 'fitGridWidth'
		},
		domLayout: 'autoHeight',
		rowStyle: {
			cursor: 'pointer',
			transition: 'all 0.2s'
		},
		rowClass: 'hover:bg-muted/50',
		headerHeight: 48,
		rowHeight: 52,
		columnDefs: [
			{
				field: 'ticker',
				headerName: 'Symbol',
				width: 120,
				cellRenderer: (params: any) => {
					return `<div class="font-medium">${params.value}</div>`;
				}
			},
			{
				field: 'region',
				width: 100,
				cellRenderer: (params: any) => {
					return `<div class="text-muted-foreground">${params.value}</div>`;
				}
			},
			{
				field: 'volume',
				headerName: 'Quantity',
				width: 120,
				cellRenderer: (params: any) => {
					return `<div class="font-medium">${params.value}</div>`;
				}
			},
			{
				field: 'price',
				headerName: 'Price',
				valueGetter: ({ data }) =>
					`${formatCurrency(data?.price ?? '', data?.region === 'US' ? 'USD' : 'HKD')}`,
				width: 130,
				cellRenderer: (params: any) => {
					return `<div class="font-medium">${params.value}</div>`;
				}
			},
			{
				field: 'platform',
				width: 130,
				cellRenderer: (params: any) => {
					return `<div class="text-muted-foreground">${params.value}</div>`;
				}
			},
			{
				field: 'tradeSide',
				headerName: 'Side',
				cellRenderer: TradeSideCellRenderer,
				cellRendererParams: {
					badge: true
				},
				width: 100
			},
			{
				field: 'executedAt',
				headerName: 'Date',
				valueFormatter: ({ value }) => new Date(value).toLocaleDateString(),
				width: 120,
				cellRenderer: (params: any) => {
					return `<div class="text-muted-foreground">${params.value}</div>`;
				}
			}
		],
		onSelectionChanged: (event) => {
			if (event.source === 'uiSelectAll' || event.source === 'rowDataChanged') {
				toggleSelectAllUnassigned();
				return;
			} else {
				const trades = event.api.getSelectedRows();
				toggleSelection(trades);
			}
		}
	};

	let gridApi: GridApi;
	const handleGridReady = (event: CustomEvent) => {
		gridApi = event.detail;
	};

	$: {
		if (gridApi) {
			gridApi.setGridOption('rowData', [...unassignedTrades]);
		} else {
			gridOptions.rowData = [...unassignedTrades];
		}
	}
</script>

<div class="w-full space-y-6">
	<HistoryNavBar bind:selectedTrades numOfTrades={trades.length} {positions} />
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold tracking-tight">
				Unassigned Trades ({unassignedTrades.length})
			</h3>
			{#if unassignedTrades.length > 0}
				<div
					class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
				>
					{Math.round((unassignedTrades.length / trades.length) * 100)}% of total
				</div>
			{/if}
		</div>
		<div
			class="border-border bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm"
		>
			<Grid
				style={'max-height: 600px'}
				{gridOptions}
				isDarkMode={$darkTheme}
				on:gridReady={handleGridReady}
				className="ag-theme-alpine"
			/>
		</div>
	</div>
</div>
