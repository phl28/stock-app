<script lang="ts">
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';
	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Trade, Position } from '$lib/types/tradeTypes';
	import { darkTheme } from '@/routes/stores';
	import Grid from './Grid.svelte';
	import type { GridOptions, GridApi } from 'ag-grid-community';
	import { TradeSideCellRenderer } from './TradeSideCellRenderer';

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
		defaultColDef: {},
		autoSizeStrategy: {
			type: 'fitGridWidth'
		},
		domLayout: 'autoHeight',
		columnDefs: [
			{
				field: 'ticker'
			},
			{
				field: 'region'
			},
			{
				field: 'volume',
				headerName: 'Quantity'
			},
			{
				field: 'price',
				valueGetter: ({ data }) =>
					`${formatCurrency(data?.price ?? '', data?.region === 'US' ? 'USD' : 'HKD')}`
			},
			{
				field: 'platform'
			},
			{
				field: 'tradeSide',
				headerName: 'Side',
				cellRenderer: TradeSideCellRenderer,
				cellRendererParams: {
					badge: true
				}
			},
			{
				field: 'executedAt',
				cellDataType: 'date'
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

<div class="w-full">
	<HistoryNavBar bind:selectedTrades numOfTrades={trades.length} {positions} />
	<div class="my-2 overflow-x-auto">
		<h5 class="mt-6 text-center">Unassigned Trades ({unassignedTrades.length})</h5>
		<Grid {gridOptions} isDarkMode={$darkTheme} on:gridReady={handleGridReady} />
	</div>
</div>
