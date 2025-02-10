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
			resizable: false
		},
		suppressMovableColumns: true,
		domLayout: 'autoHeight',
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
				}
			},
			{
				field: 'reward',
				headerName: 'Account Growth',
				valueFormatter: ({ value }) => `${(value * 100).toFixed(2)}%`
			},
			{
				field: 'profit',
				headerName: 'Trade Profit',
				valueFormatter: ({ value }) => `${(value * 100).toFixed(2)}%`
			},
			{
				field: 'coverPrice',
				headerName: 'Target Price',
				valueFormatter: ({ value }) => `$${value.toFixed(2)}`
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

<div class="overflow-auto rounded-lg border bg-base-100">
	<Grid
		{gridOptions}
		isDarkMode={$darkTheme}
		on:gridReady={handleGridReady}
		on:cellValueChanged={handleCellValueChanged}
	/>
</div>
