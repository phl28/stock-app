<script lang="ts">
	import { goto } from '$app/navigation';
	import { darkTheme } from '@/routes/stores';

	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Position } from '$lib/types/tradeTypes';
	import Grid from './Grid.svelte';
	import PositionNavBar from './PositionNavBar.svelte';
	import { TradeSideCellRenderer } from './TradeSideCellRenderer';

	import type { GetRowIdParams, GridOptions } from 'ag-grid-community';

	export let positions: Position[];

	const handlePositionRowClick = (position: Position) => {
		goto('/position/' + position.id);
	};

	const gridOptions: GridOptions<Position> = {
		getRowId: (params: GetRowIdParams<Position>) => params.data.id.toString(),
		suppressMovableColumns: true,
		suppressCellFocus: true,
		rowData: positions,
		autoSizeStrategy: {
			type: 'fitGridWidth'
		},
		defaultColDef: {
			cellStyle: {
				display: 'flex',
				justifyContent: 'flex-start',
				alignItems: 'center'
			},
			width: 80
		},
		onRowClicked: (event) => {
			if (!event.data) return;
			handlePositionRowClick(event.data);
		},
		domLayout: 'autoHeight',
		columnDefs: [
			{
				field: 'closedAt',
				cellDataType: 'boolean',
				headerName: 'Active',
				valueGetter: ({ data }) => {
					return data?.closedAt === null;
				}
			},
			{
				field: 'isShort',
				valueGetter: ({ data }) => {
					return data?.isShort ? 'Short' : 'Long';
				},
				cellDataType: 'text',
				headerName: 'Side',
				cellRenderer: TradeSideCellRenderer,
				cellRendererParams: {
					badge: true
				}
			},
			{
				field: 'ticker',
				headerName: 'Symbol'
			},
			{
				field: 'platform'
			},
			{
				field: 'region'
			},
			{
				field: 'numOfTrades',
				headerName: 'Trades'
			},
			{
				field: 'totalVolume',
				headerName: 'Quantity'
			},
			{
				field: 'averageEntryPrice',
				valueFormatter: ({ data }) =>
					formatCurrency(data?.averageEntryPrice ?? '', data?.region === 'US' ? 'USD' : 'HKD'),
				headerName: 'Avg. Price',
				cellDataType: 'number'
			},
			{
				field: 'grossProfitLoss',
				headerName: 'P/L',
				valueFormatter: ({ data }) => {
					return formatCurrency(data?.grossProfitLoss ?? '', data?.region === 'US' ? 'USD' : 'HKD');
				},
				cellDataType: 'number'
			},
			{
				field: 'openedAt',
				cellDataType: 'date',
				headerName: 'Date'
			}
		]
	};
</script>

<div class="w-full space-y-6">
	<PositionNavBar numOfPositions={positions.length} />
	<Grid style={'max-height: 600px'} {gridOptions} isDarkMode={$darkTheme} />
</div>
