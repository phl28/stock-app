<script lang="ts">
	import { Chart, CandlestickSeries, HistogramSeries, PriceScale } from 'svelte-lightweight-charts';
	import {
		ColorType,
		CrosshairMode,
		LineStyle,
		type ISeriesApi,
		type SeriesMarker,
		type Time
	} from 'lightweight-charts';
	import type { PageData } from './$types';
	import { dispatchToast, darkTheme, modalStore } from '@/routes/stores.ts';
	import type { StockData, VolumeData } from '@/lib/types/chartTypes.ts';
	import { convertUnixTimestampToDate, formatDuration } from '@/lib/helpers/DataHelpers.ts';
	import { onMount, tick } from 'svelte';
	import { ArrowDown, ArrowUp, CheckCheck, EllipsisVertical } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { formatCurrency } from '@/lib/helpers/CurrencyHelpers.ts';
	import Editor from '@/lib/components/Editor.svelte';
	import Grid from '@/lib/components/Grid.svelte';
	import {
		colorSchemeDarkBlue,
		themeQuartz,
		type GridApi,
		type GridOptions
	} from 'ag-grid-community';
	import type { Trade } from '@/lib/types/tradeTypes.ts';
	import { TradeSideCellRenderer } from '@/lib/components/TradeSideCellRenderer.ts';
	import EditPositionModal from '@/lib/components/EditPositionModal.svelte';
	import calculator from '@/lib/calculator/calculator';

	export let data: PageData;

	let chartSeries: ISeriesApi<'Candlestick'> | null = null;
	let volumeSeries: ISeriesApi<'Histogram'> | null = null;
	//  only used when there are SMA data
	let lineSeries: ISeriesApi<'Line'> | null = null;

	let container: HTMLDivElement;
	let containerWidth = 600;
	let containerHeight = 300;
	let resizeObserver: ResizeObserver;

	function debounce<T extends (...args: any[]) => any>(
		func: T,
		wait: number
	): (...args: Parameters<T>) => void {
		let timeout: NodeJS.Timeout;
		return (...args: Parameters<T>) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), wait);
		};
	}

	onMount(() => {
		if (data) {
			if (data.stockData) {
				try {
					fillChartData(data);
				} catch (err) {
					dispatchToast({ type: 'error', message: 'Error initializing chart' });
				}
			}
			if (data.position) {
				fillPositionData(data.position, data.trades ?? []);
			}
		}

		if (container) {
			const parentWidth = container.parentElement?.clientWidth ?? 600;
			containerWidth = Math.min(parentWidth, 600);
			containerHeight = Math.round(containerWidth * 0.5);

			resizeObserver = new ResizeObserver(updateDimensions);
			resizeObserver.observe(container);
		}

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	});

	$: {
		if (data) {
			if (data.stockData) {
				try {
					fillChartData(data);
				} catch (err) {
					dispatchToast({ type: 'error', message: 'Error initializing chart' });
				}
			}
			if (data.position) {
				fillPositionData(data.position, data.trades ?? []);
			}
		}
	}

	let stockData: StockData[];
	let volumeData: VolumeData[];

	const fillChartData = async (data: any) => {
		if (!data.stockData.results) {
			dispatchToast({ type: 'error', message: 'No data found' });
			return;
		}
		let stock: StockData[] = [];
		let volume: VolumeData[] = [];
		let prevClose = 0;
		for (const item of data.stockData.results) {
			const date = convertUnixTimestampToDate(item.t);
			stock = [
				...stock,
				{
					time: date,
					open: item.o,
					high: item.h,
					low: item.l,
					close: item.c
				}
			];
			volume = [
				...volume,
				{
					time: date,
					value: item.v,
					color: prevClose < item.c ? 'rgba(0, 150, 136, 0.8)' : 'rgba(255,82,82, 0.8)'
				}
			];
			prevClose = item.c;
		}
		stockData = stock;
		volumeData = volume;
		await tick();
		if (!chartSeries || !volumeSeries) {
			return;
		}
		chartSeries.setData(stockData);
		volumeSeries.setData(volumeData);
	};

	const fillPositionData = async (position: any, trades: any[]) => {
		let markers: SeriesMarker<Time>[] = [];
		for (const trade of trades) {
			markers = [
				...markers,
				{
					time: new Date(trade.executedAt ?? '').toISOString().split('T')[0],
					position: trade.tradeSide === 'BUY' ? 'belowBar' : 'aboveBar',
					text: `${trade.volume}`,
					color: trade.tradeSide === 'BUY' ? '#2563eb' : '#f97316',
					shape: trade.tradeSide === 'BUY' ? 'arrowUp' : 'arrowDown'
				}
			];
		}
		await tick();
		chartSeries?.setMarkers(markers);
		chartSeries?.createPriceLine({
			price: Number(position.averageEntryPrice),
			color: 'green',
			lineWidth: 2,
			lineStyle: LineStyle.Dotted,
			axisLabelVisible: true,
			title: 'Avg Entry'
		});
		if (position.averageExitPrice) {
			chartSeries?.createPriceLine({
				price: Number(position.averageExitPrice),
				color: 'red',
				lineWidth: 2,
				lineStyle: LineStyle.Dotted,
				axisLabelVisible: true,
				title: 'Avg Exit'
			});
		}
		if (position.profitTargetPrice) {
			chartSeries?.createPriceLine({
				price: Number(position.profitTargetPrice),
				color: 'blue',
				lineWidth: 2,
				lineStyle: LineStyle.Dotted,
				axisLabelVisible: true,
				title: 'Target'
			});
		}
		if (position.stopLossPrice) {
			chartSeries?.createPriceLine({
				price: Number(position.stopLossPrice),
				color: 'orange',
				lineWidth: 2,
				lineStyle: LineStyle.Dotted,
				axisLabelVisible: true,
				title: 'Stop Loss'
			});
		}
	};

	const updateDimensions = debounce((entries: ResizeObserverEntry[]) => {
		for (const entry of entries) {
			const { width } = entry.contentRect;
			containerWidth = Math.min(width, container.parentElement?.clientWidth ?? width);
			containerHeight = Math.round(containerWidth * 0.5);
		}
	}, 100);

	const handleCandlestickSeriesReference = (ref: ISeriesApi<'Candlestick'> | null) => {
		chartSeries = ref;
	};

	const handleVolumeSeriesReference = (ref: ISeriesApi<'Histogram'> | null) => {
		volumeSeries = ref;
	};

	const THEMES = {
		Dark: {
			chart: {
				layout: {
					background: { type: ColorType.Solid, color: '#1D232A' },
					lineColor: '#2B2B43',
					textColor: '#D9D9D9'
				},
				grid: {
					vertLines: { color: '#2B2B43' },
					horzLines: { color: '#363C4E' }
				}
			},
			series: {
				topColor: 'rgba(32, 226, 47, 0.56)',
				bottomColor: 'rgba(32, 226, 47, 0.04)',
				lineColor: 'rgba(32, 226, 47, 1)'
			}
		},
		Light: {
			chart: {
				layout: {
					background: { type: ColorType.Solid, color: '#FFFFFF' },
					lineColor: '#2B2B43',
					textColor: '#191919'
				},
				grid: {
					vertLines: { visible: false },
					horzLines: { color: '#f0f3fa' }
				}
			},
			series: {
				topColor: 'rgba(33, 150, 243, 0.56)',
				bottomColor: 'rgba(33, 150, 243, 0.04)',
				lineColor: 'rgba(33, 150, 243, 1)'
			}
		}
	};

	let waterMarkText: string = `${data.position?.ticker} 1D`;
	$: watermark = {
		visible: true,
		fontSize: 48,
		horzAlign: 'center' as const,
		vertAlign: 'center' as const,
		color: 'rgba(171, 71, 188, 0.15)',
		text: waterMarkText
	};

	$: chartOptions = {
		width: containerWidth,
		height: containerHeight,
		crosshair: { mode: CrosshairMode.Magnet },
		rightPriceScale: {
			borderColor: 'rgba(197, 203, 206, 0.8)',
			scaleMargins: { top: 0.3, bottom: 0.25 }
		},
		timeScale: {
			borderColor: 'rgba(197, 203, 206, 0.8)'
		},
		layout: {
			background: {
				type: ColorType.Solid,
				color: '#FFFFFF'
			},
			textColor: '#333'
		}
	};

	const toggleEditPositionModal = () => {
		modalStore.toggleEditPositionModal();
	};

	let editingCell: { rowIndex: number; column: string } | null = null;

	$: editingState = (rowIndex: number, column: string) =>
		editingCell?.rowIndex === rowIndex && editingCell?.column === column;
	// Temporary storage for edited values
	let editValue: string = '';

	// Function to start editing a cell
	const startEditing = async (rowIndex: number, column: string, value: string | number) => {
		editingCell = { rowIndex, column };
		editValue = value.toString();
		await tick();
	};

	// Function to save edited value
	const saveEdit = async (position: any) => {
		// if (!editingCell) return;
		// try {
		// 	const response = await fetch('/api/position/update', {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		},
		// 		body: JSON.stringify({
		// 			tradeId: position.tradeId,
		// 			[editingCell.column]: editValue
		// 		})
		// 	});
		// 	if (!response.ok) throw new Error('Failed to update position');
		// 	dispatchToast({ type: 'success', message: 'Position updated successfully!' });
		// 	await invalidateAll();
		// } catch (error) {
		// 	dispatchToast({ type: 'error', message: 'Failed to update position' });
		// }
		// editingCell = null;
	};

	const handleKeyDown = (event: KeyboardEvent, position: any) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			saveEdit(position);
		} else if (event.key === 'Escape') {
			editingCell = null;
		}
	};

	const handleSaveJournal = async (outputData: any) => {
		if (!data.position) return;
		try {
			const response = await fetch(`/position/${data.position.id}/journal/update`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					journal: outputData
				})
			});
			if (!response.ok) {
				throw new Error('Failed to save journal');
			}
		} catch (error) {
			console.error('Error saving article:', error);
			dispatchToast({ type: 'error', message: 'Failed to save article' });
		}
	};

	const handleRemoveImages = async (removedImagesUrl: string[]) => {
		try {
			const response = await fetch(`/images/delete`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					imageUrls: removedImagesUrl
				})
			});
			if (!response.ok) {
				throw new Error('Failed to delete images');
			}
		} catch (error) {
			dispatchToast({ type: 'error', message: 'Failed to delete images' });
		}
	};

	type TradeGrid = Pick<Trade, 'tradeSide' | 'executedAt' | 'price' | 'fees' | 'volume'>;
	const gridOptions: GridOptions<TradeGrid> = {
		suppressMovableColumns: true,
		suppressCellFocus: true,
		defaultColDef: {
			cellStyle: { fontSize: '12px !important' },
			resizable: false
		},
		autoSizeStrategy: {
			type: 'fitGridWidth'
		},
		columnDefs: [
			{
				field: 'tradeSide',
				headerName: '',
				cellRenderer: TradeSideCellRenderer,
				width: 100
			},
			{
				field: 'executedAt',
				headerName: 'Time',
				valueFormatter: ({ value }) => new Date(value).toLocaleDateString(),
				flex: 1
			},
			{
				field: 'price',
				headerName: 'Price',
				valueFormatter: ({ value }) => `${Number(value).toFixed(2)}`,
				width: 150
			},
			{
				field: 'fees',
				headerName: 'Fees',
				valueFormatter: ({ value }) => `${Number(value).toFixed(2)}`,
				width: 150
			},
			{
				field: 'volume',
				headerName: 'Volume',
				width: 180
			}
		]
	};

	let gridApi: GridApi;

	$: {
		if (gridApi) {
			gridApi.setGridOption('rowData', [...(data.trades ?? [])]);
		}
	}
	const handleGridReady = (event: CustomEvent) => {
		const api = event.detail;
		gridApi = api;
	};
	$: if (gridApi) {
		gridApi.setGridOption(
			'theme',
			$darkTheme ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz
		);
	}

	const { calcRewardToRisk } = calculator;
	let rR: number | undefined = undefined;
	$: {
		const risk = Number(data.position?.averageEntryPrice) - Number(data.position?.stopLossPrice);
		const reward =
			Number(data.position?.profitTargetPrice) - Number(data.position?.averageEntryPrice);
		rR = calcRewardToRisk(risk, reward);
	}
</script>

<section>
	<div class="mb-4 flex items-center justify-between">
		<h1 class="flex items-center gap-2">
			{data.position?.ticker}
			<div
				class={`badge badge-lg text-sm font-normal ${data.position?.isShort ? 'badge-error' : 'badge-success'}`}
			>
				{#if data.position?.isShort}
					<ArrowDown strokeWidth="1" size={20} />Short
				{:else}
					<ArrowUp strokeWidth="1" size={20} />Long
				{/if}
			</div>
		</h1>
		<div id="top-bar-right" class="flex items-center gap-2">
			<div class="dropdown dropdown-end dropdown-bottom">
				<div tabindex="0" role="button" class="btn m-1"><EllipsisVertical /></div>
				<ul class="menu dropdown-content z-[1000] w-52 rounded-box bg-base-100 p-2 shadow">
					<li>
						<button on:click={toggleEditPositionModal}>Edit Position</button>
					</li>
					<div class="divider m-0 p-0"></div>
					<li>
						<form
							method="POST"
							action="?/deletePosition"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										goto('/trade/1');
										dispatchToast({ type: 'success', message: 'Position deleted successfully!' });
									} else if (result.type === 'error') {
										dispatchToast({ type: 'error', message: result.error.message });
									}
								};
							}}
						>
							<button type="submit">Delete Position</button>
						</form>
					</li>
				</ul>
			</div>
			<form method="POST" action="?/markPositionReviewed">
				<button class="btn btn-primary" type="submit" disabled={data.position?.reviewedAt !== null}
					><CheckCheck /> Mark as reviewed</button
				>
			</form>
		</div>
	</div>
	<div class="relative flex w-full gap-2 px-2">
		<div class="relative flex w-4/6 flex-col px-2" bind:this={container}>
			<Chart {...chartOptions} {watermark} {...THEMES[$darkTheme ? 'Dark' : 'Light'].chart}>
				<CandlestickSeries
					bind:data={stockData}
					title={data.position?.ticker}
					lastValueVisible={true}
					priceLineVisible={true}
					upColor="#10B981"
					downColor="#EF4444"
					ref={handleCandlestickSeriesReference}
				/>
				<HistogramSeries
					bind:data={volumeData}
					priceScaleId="volume"
					color="#10B981"
					priceFormat={{ type: 'volume' }}
					ref={handleVolumeSeriesReference}
				/>
				<PriceScale id="volume" scaleMargins={{ top: 0.8, bottom: 0 }} />
			</Chart>
			<Editor
				readOnly={false}
				data={data.position?.journal ?? {}}
				onSave={handleSaveJournal}
				removeImages={handleRemoveImages}
				placeholder="What are your thoughts on this trade?"
				autoSave={true}
			></Editor>
		</div>
		<div class="relative w-2/6 px-2">
			<div class="card mb-4 w-full bg-base-100 shadow-xl">
				<div class="card-body">
					<h6>Trades</h6>
					<Grid
						style="height: 250px"
						{gridOptions}
						isDarkMode={$darkTheme}
						on:gridReady={handleGridReady}
					/>
				</div>
			</div>
			<div class="card mb-4 w-full bg-base-100 shadow-xl">
				<div class="card-body">
					<h6>Risk / Reward</h6>
					<label class="form-control w-full">
						<div class="label">
							<span class="label-text">Stop Loss</span>
						</div>
						<input type="number" value={data.position?.stopLossPrice} disabled />
					</label>
					<label class="form-control w-full">
						<div class="label">
							<span class="label-text">Profit Target</span>
						</div>
						<input type="number" value={data.position?.profitTargetPrice} disabled />
					</label>
					<label class="form-control w-full">
						<div class="label">
							<span class="label-text">R/R</span>
						</div>
						<input type="number" value={data.position?.profitTargetPrice} disabled />
					</label>
				</div>
			</div>
			<div class="card w-full bg-base-100 shadow-xl">
				<div class="card-body">
					<h6>Details</h6>
					<div class="flex flex-col gap-2">
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Gross Profit / Loss</span>
							<span
								class={Number(data.position?.grossProfitLoss) >= 0 ? 'text-success' : 'text-error'}
							>
								{formatCurrency(
									data.position?.grossProfitLoss ?? '0',
									data.position?.region === 'US' ? 'USD' : 'HKD'
								)}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Net Profit / Loss</span>
							<span
								class={Number(data.position?.grossProfitLoss) - Number(data.position?.totalFees) >=
								0
									? 'text-success'
									: 'text-error'}
							>
								{formatCurrency(
									String(Number(data.position?.grossProfitLoss) - Number(data.position?.totalFees)),
									data.position?.region === 'US' ? 'USD' : 'HKD'
								)}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Total Fees</span>
							<span
								>{formatCurrency(
									data.position?.totalFees ?? '0',
									data.position?.region === 'US' ? 'USD' : 'HKD'
								)}</span
							>
						</div>
						<div class="divider my-0"></div>
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Side</span>
							<span class={`badge ${data.position?.isShort ? 'badge-error' : 'badge-success'}`}>
								{data.position?.isShort ? 'SHORT' : 'LONG'}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Quantity</span>
							<span>{data.position?.totalVolume}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Executions</span>
							<span>{data.trades?.length ?? 0}</span>
						</div>
						<div class="divider my-0"></div>
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Entry Price</span>
							<span
								>{formatCurrency(
									data.trades?.at(0)?.price ?? '',
									data.position?.region === 'US' ? 'USD' : 'HKD'
								)}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Exit Price</span>
							<span
								>{formatCurrency(
									data.trades?.at(-1)?.price ?? '',
									data.position?.region === 'US' ? 'USD' : 'HKD'
								)}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Average Entry Price</span>
							<span
								>{formatCurrency(
									data.position?.averageEntryPrice ?? '',
									data.position?.region === 'US' ? 'USD' : 'HKD'
								)}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Average Exit Price</span>
							<span
								>{formatCurrency(
									data.position?.averageExitPrice ?? '',
									data.position?.region === 'US' ? 'USD' : 'HKD'
								)}</span
							>
						</div>
						<div class="divider my-0"></div>
						<div class="flex justify-between">
							<span class="text-sm opacity-75">Duration</span>
							<span
								>{formatDuration(
									new Date(data.trades?.at(0)?.executedAt ?? ''),
									new Date(data.trades?.at(-1)?.executedAt ?? '')
								)}</span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	{#if data.position && data.trades && $modalStore.editPositionModal}
		<EditPositionModal
			isModalOpen={$modalStore.editPositionModal}
			trades={data.trades}
			position={data.position}
			handleCloseModal={toggleEditPositionModal}
		/>
	{/if}
</section>
