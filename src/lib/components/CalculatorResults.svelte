<script lang="ts">
	import Grid from '$lib/components/Grid.svelte';
	import { darkTheme } from '@/routes/stores';

	import calculator from '$lib/calculator/calculator';
	import { RRCellRenderer } from './RRCellRenderer';

	import type { GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';

	export let input = {
		risk: 0.0003,
		entry: 100,
		stop: 96,
		target: 120,
		stopLossPerc: 0.004
	};

	interface CalculatorInput {
		risk: number;
		entry: number;
		stop: number;
		target: number;
		stopLossPerc: number;
	}

	interface TableData {
		rr: number;
		reward: number;
		profit: number;
		coverPrice: number;
	}

	$: data = calculateData(input);
	const { calcProfitPerc, calcRewardPerc, calcCoverPrice } = calculator;
	const riskReward = [2.0, 3.0, 4.0, 5.0];

	const calculateData = (input: CalculatorInput): TableData[] => {
		return riskReward.map((item) => {
			const reward = calcRewardPerc(undefined, undefined, item, input.risk / 100);
			const profit = calcProfitPerc(undefined, undefined, input.stopLossPerc, item);
			const coverPrice = calcCoverPrice(input.entry, profit);
			return { rr: item, reward, profit, coverPrice };
		});
	};

	let gridApi: GridApi;
	const handleGridReady = (event: CustomEvent) => {
		const api = event.detail;
		gridApi = api;
	};

	let customRR: number = 6;

	$: customData = {
		rr: customRR,
		reward: calcRewardPerc(undefined, undefined, customRR, input.risk / 100),
		profit: calcProfitPerc(undefined, undefined, input.stopLossPerc, customRR),
		get coverPrice() {
			return calcCoverPrice(input.entry, this.profit);
		}
	};

	const gridOptions: GridOptions<TableData> = {
		defaultColDef: {
			resizable: true,
			cellStyle: {
				display: 'flex',
				justifyContent: 'flex-start',
				alignItems: 'center',
				padding: '0.75rem 1rem',
				fontSize: '0.875rem',
				fontFamily: 'var(--font-sans)',
				transition: 'background-color 0.2s'
			}
		},
		suppressMovableColumns: true,
		domLayout: 'autoHeight',
		headerHeight: 48,
		rowHeight: 52,
		rowClass: 'hover:bg-muted/50',
		columnDefs: [
			{
				field: 'rr',
				headerName: 'Risk/Reward',
				valueFormatter: ({ value }) => `${value}:1`,
				editable: ({ node }) => {
					return node.rowIndex === 4;
				},
				cellEditor: 'agNumberCellEditor',
				valueParser: (params) => {
					return Number(params.newValue);
				},
				cellRendererSelector: (params: ICellRendererParams<TableData>) => {
					if (params.node.rowIndex === 4) {
						return {
							component: RRCellRenderer
						};
					}
				},
				cellRenderer: (params: any) => {
					if (params.node.rowIndex !== 4) {
						return `<div class="font-medium">${params.valueFormatted}</div>`;
					}
				}
			},
			{
				field: 'reward',
				headerName: 'Account Growth',
				valueFormatter: ({ value }) => `${(value * 100).toFixed(2)}%`,
				cellRenderer: (params: any) => {
					const value = parseFloat(params.valueFormatted);
					const isPositive = value > 0;
					return `<div class="font-medium ${isPositive ? 'text-success' : 'text-error'}">${
						params.valueFormatted
					}</div>`;
				}
			},
			{
				field: 'profit',
				headerName: 'Trade Profit',
				valueFormatter: ({ value }) => `${(value * 100).toFixed(2)}%`,
				cellRenderer: (params: any) => {
					const value = parseFloat(params.valueFormatted);
					const isPositive = value > 0;
					return `<div class="font-medium ${isPositive ? 'text-success' : 'text-error'}">${
						params.valueFormatted
					}</div>`;
				}
			},
			{
				field: 'coverPrice',
				headerName: 'Target Price',
				valueFormatter: ({ value }) => `$${value.toFixed(2)}`,
				cellRenderer: (params: any) => {
					return `<div class="font-medium text-muted-foreground">${params.valueFormatted}</div>`;
				}
			}
		]
	};

	$: {
		if (gridApi) {
			gridApi.setGridOption('rowData', [...data, customData]);
		} else {
			gridOptions.rowData = [...data, customData];
		}
	}

	function handleCellValueChanged(event: CustomEvent) {
		const { rowIndex, newValue } = event.detail;
		if (rowIndex === 4) {
			customRR = Number(newValue);
		}
	}
</script>

<div class="border-border bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm">
	<Grid
		{gridOptions}
		isDarkMode={$darkTheme}
		on:gridReady={handleGridReady}
		on:cellValueChanged={handleCellValueChanged}
		className="ag-theme-alpine"
	/>
</div>
