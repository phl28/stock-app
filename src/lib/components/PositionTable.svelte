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
				cursor: 'pointer',
				padding: '0.75rem 1rem',
				fontSize: '0.875rem'
			},
			width: 150
		},
		onRowClicked: (event) => {
			if (!event.data) return;
			handlePositionRowClick(event.data);
		},
		domLayout: 'autoHeight',
		rowStyle: {
			cursor: 'pointer',
			transition: 'all 0.2s'
		},
		rowClass: 'hover:bg-base-200/50',
		columnDefs: [
			{
				field: 'closedAt',
				cellDataType: 'boolean',
				headerName: 'Status',
				valueGetter: ({ data }) => {
					return data?.closedAt === null;
				},
				cellRenderer: (params: any) => {
					const isActive = params.value;
					return `<div class="badge ${
						isActive ? 'badge-success' : 'badge-ghost'
					} text-xs font-medium">
						${isActive ? 'Active' : 'Closed'}
					</div>`;
				},
				width: 100
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
				field: 'ticker',
				headerName: 'Symbol',
				width: 120
			},
			{
				field: 'platform',
				width: 130
			},
			{
				field: 'region',
				width: 100
			},
			{
				field: 'numOfTrades',
				headerName: 'Trades',
				width: 100
			},
			{
				field: 'totalVolume',
				headerName: 'Quantity',
				width: 120
			},
			{
				field: 'averageEntryPrice',
				valueGetter: ({ data }) =>
					formatCurrency(data?.averageEntryPrice ?? '', data?.region === 'US' ? 'USD' : 'HKD'),
				headerName: 'Avg. Price',
				width: 130
			},
			{
				field: 'grossProfitLoss',
				headerName: 'P/L',
				cellRenderer: (params: any) => {
					const value = params.value;
					const isPositive = value > 0;
					return `<div class="font-medium ${isPositive ? 'text-success' : 'text-error'}">
						${formatCurrency(value ?? '', params.data.region === 'US' ? 'USD' : 'HKD')}
					</div>`;
				},
				width: 130
			},
			{
				field: 'openedAt',
				cellDataType: 'date',
				headerName: 'Date',
				valueFormatter: ({ value }) => new Date(value).toLocaleDateString(),
				width: 120
			}
		]
	};
</script>

<div class="w-full space-y-4">
	<PositionNavBar numOfPositions={positions.length} />
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
