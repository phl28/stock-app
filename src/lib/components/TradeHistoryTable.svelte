<script lang="ts">
	import { darkTheme } from '@/routes/stores';
	import Grid from './Grid.svelte';
	import HistoryNavBar from '$lib/components/HistoryNavBar.svelte';

	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Trade, Position } from '$lib/types/tradeTypes';
	import { TradeSideCellRenderer } from './TradeSideCellRenderer';

	import type { GridOptions, GridApi, GetRowIdParams } from 'ag-grid-community';

	interface Props {
		unassignedTrades: Trade[];
		positions: Position[];
	}

	let { unassignedTrades, positions }: Props = $props();

	let selectedTrades: Trade[] = $state([]);

	const toggleSelection = (trade: Trade[]) => {
		selectedTrades = trade;
	};

	const gridOptions: GridOptions<Trade> = $state({
		getRowId: (params: GetRowIdParams<Trade>) => params.data.id.toString(),
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
			const trades = event.api.getSelectedRows();
			toggleSelection(trades);
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
	<HistoryNavBar {selectedTrades} numOfTrades={unassignedTrades.length} {positions} />
	<div class="my-2 overflow-x-auto">
		<Grid {gridOptions} isDarkMode={$darkTheme} gridReady={handleGridReady} />
	</div>
</div>
