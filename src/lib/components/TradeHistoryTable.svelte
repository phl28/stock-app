<script lang="ts">
	import { darkTheme } from '@/routes/stores';
	import Grid from './Grid.svelte';
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';

	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Trade, Position } from '$lib/types/tradeTypes';
	import { TradeSideCellRenderer } from './TradeSideCellRenderer';

	import type { GridOptions, GridApi } from 'ag-grid-community';

	interface Props {
		trades: Trade[];
		positions: Position[];
	}

	let { trades, positions }: Props = $props();

	let selectedTrades: Trade[] = $state([]);
	let selectedAllUnassigned: boolean = false;

	const toggleSelection = (trade: Trade[]) => {
		selectedTrades = trade;
	};

	let unassignedTrades: Trade[] = $derived(trades.filter((trade) => !trade.positionId));

	const toggleSelectAllUnassigned = () => {
		if (selectedAllUnassigned) {
			selectedTrades = [];
		} else {
			selectedTrades = [...unassignedTrades];
		}
		selectedAllUnassigned = !selectedAllUnassigned;
	};

	const gridOptions: GridOptions<Trade> = $state({
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
	});

	let gridApi: GridApi | undefined = $state();
	const handleGridReady = (api: GridApi) => {
		gridApi = api;
	};

	$effect(() => {
		if (gridApi) {
			gridApi.setGridOption('rowData', [...unassignedTrades]);
		} else {
			gridOptions.rowData = [...unassignedTrades];
		}
	});
</script>

<div class="w-full">
	<HistoryNavBar bind:selectedTrades numOfTrades={trades.length} {positions} />
	<div class="my-2 overflow-x-auto">
		<h5 class="mt-6 text-center">Unassigned Trades ({unassignedTrades.length})</h5>
		<Grid {gridOptions} isDarkMode={$darkTheme} gridReady={handleGridReady} />
	</div>
</div>
