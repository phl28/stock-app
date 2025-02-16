<script lang="ts">
	import { goto } from '$app/navigation';
	import { darkTheme } from '@/routes/stores';

	import { formatCurrency } from '$lib/helpers/CurrencyHelpers';
	import type { Position } from '$lib/types/tradeTypes';
	import Grid from './Grid.svelte';
	import PositionNavBar from './PositionNavBar.svelte';
	import { TradeSideCellRenderer } from './TradeSideCellRenderer';

	import type { GridApi, GridOptions } from 'ag-grid-community';

	export let positions: Position[];

	const handlePositionRowClick = (position: Position) => {
		goto('/position/' + position.id);
	};

	let gridApi: GridApi;
	const handleGridReady = (event: CustomEvent) => {
		const api = event.detail;
		gridApi = api;
	};
	const gridOptions: GridOptions<Position> = {
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
				alignItems: 'center',
				cursor: 'pointer'
			},
			filter: true,
			width: 150
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
				},
				width: 90
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
				},
				width: 100
			},
			{
				field: 'ticker'
			},
			{
				field: 'platform'
			},
			{
				field: 'region'
			},
			{
				field: 'numOfTrades',
				headerName: '# of Trades'
			},
			{
				field: 'totalVolume',
				headerName: 'Quantity'
			},
			{
				field: 'averageEntryPrice',
				valueFormatter: ({ data }) =>
					formatCurrency(data?.averageEntryPrice ?? '', data?.region === 'US' ? 'USD' : 'HKD'),
				headerName: 'Average Price'
			},
			{
				field: 'grossProfitLoss',
				headerName: 'Gross P/L',
				valueFormatter: ({ data }) =>
					formatCurrency(data?.grossProfitLoss ?? '', data?.region === 'US' ? 'USD' : 'HKD')
			},
			{
				field: 'openedAt',
				cellDataType: 'date'
			}
		]
	};
</script>

<div class="w-full">
	<PositionNavBar numOfPositions={positions.length} />
	<div class="overflow-x-auto">
		<Grid
			style={'max-height: 500px'}
			{gridOptions}
			isDarkMode={$darkTheme}
			on:gridReady={handleGridReady}
		/>
	</div>
</div>
