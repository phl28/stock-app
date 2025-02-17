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
				fontSize: '0.875rem'
			}
		},
		autoSizeStrategy: {
			type: 'fitGridWidth'
		},
		domLayout: 'autoHeight',
		rowStyle: {
			cursor: 'pointer',
			transition: 'all 0.2s'
		},
		rowClass: 'hover:bg-base-200/50',
		columnDefs: [
			{
				field: 'ticker',
				headerName: 'Symbol',
				width: 120
			},
			{
				field: 'region',
				width: 100
			},
			{
				field: 'volume',
				headerName: 'Quantity',
				width: 120
			},
			{
				field: 'price',
				headerName: 'Price',
				valueGetter: ({ data }) =>
					`${formatCurrency(data?.price ?? '', data?.region === 'US' ? 'USD' : 'HKD')}`,
				width: 130
			},
			{
				field: 'platform',
				width: 130
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
				width: 120
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

<div class="w-full space-y-4">
	<HistoryNavBar bind:selectedTrades numOfTrades={trades.length} {positions} />
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h5 class="text-lg font-semibold">Unassigned Trades ({unassignedTrades.length})</h5>
			{#if unassignedTrades.length > 0}
				<div class="badge badge-primary">
					{Math.round((unassignedTrades.length / trades.length) * 100)}% of total
				</div>
			{/if}
		</div>
		<div class="card overflow-hidden bg-base-100 p-0">
			<Grid
				style={'max-height: 500px'}
				{gridOptions}
				isDarkMode={$darkTheme}
				on:gridReady={handleGridReady}
				className="rounded-xl"
			/>
		</div>
	</div>
</div>
