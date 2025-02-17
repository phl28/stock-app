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
				fontSize: '0.875rem',
				fontFamily: 'var(--font-sans)',
				transition: 'background-color 0.2s'
			},
			width: 150,
			sortable: true,
			resizable: true
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
		rowClass: 'hover:bg-muted/50',
		headerHeight: 48,
		rowHeight: 52,
		columnDefs: [
			{
				field: 'closedAt',
				cellDataType: 'boolean',
				headerName: 'Status',
				valueGetter: ({ data }) => data?.closedAt === null,
				cellRenderer: (params: any) =>
					`<div class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${params.value ? 'bg-success/20 text-success-foreground' : 'bg-muted text-muted-foreground'}">${params.value ? 'Active' : 'Closed'}</div>`,
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
				width: 120,
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
				field: 'region',
				width: 100,
				cellRenderer: (params: any) => {
					return `<div class="text-muted-foreground">${params.value}</div>`;
				}
			},
			{
				field: 'numOfTrades',
				headerName: 'Trades',
				width: 100,
				cellRenderer: (params: any) => {
					return `<div class="font-medium">${params.value}</div>`;
				}
			},
			{
				field: 'totalVolume',
				headerName: 'Quantity',
				width: 120,
				cellRenderer: (params: any) => {
					return `<div class="font-medium">${params.value}</div>`;
				}
			},
			{
				field: 'averageEntryPrice',
				valueGetter: ({ data }) =>
					formatCurrency(data?.averageEntryPrice ?? '', data?.region === 'US' ? 'USD' : 'HKD'),
				headerName: 'Avg. Price',
				width: 130,
				cellRenderer: (params: any) => {
					return `<div class="font-medium">${params.value}</div>`;
				}
			},
			{
				field: 'grossProfitLoss',
				headerName: 'P/L',
				cellRenderer: (params: any) => {
					const value = params.value;
					const isPositive = value > 0;
					return `<div class="font-medium ${isPositive ? 'text-success' : 'text-error'}">${formatCurrency(value ?? '', params.data.region === 'US' ? 'USD' : 'HKD')}</div>`;
				},
				width: 130
			},
			{
				field: 'openedAt',
				cellDataType: 'date',
				headerName: 'Date',
				valueFormatter: ({ value }) => new Date(value).toLocaleDateString(),
				width: 120,
				cellRenderer: (params: any) => {
					return `<div class="text-muted-foreground">${params.value}</div>`;
				}
			}
		]
	};
</script>

<div class="w-full space-y-6">
	<PositionNavBar numOfPositions={positions.length} />
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
