<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount, tick } from 'svelte';

	import { dispatchToast, darkTheme } from '../stores.ts';
	import { convertUnixTimestampToDate } from '$lib/helpers/DataHelpers';
	import type { StockData, VolumeData } from '$lib/types/chartTypes';
	import CalculatorResults from '$lib/components/CalculatorResults.svelte';
	import calculator from '$lib/calculator/calculator';

	import { Chart, CandlestickSeries, HistogramSeries, PriceScale } from 'svelte-lightweight-charts';
	import { ColorType, CrosshairMode, type ISeriesApi } from 'lightweight-charts';
	import { Search } from 'lucide-svelte';

	export let data;
	let containerWidth = 600;
	let containerHeight = 300;
	let container: HTMLDivElement;
	let resizeObserver: ResizeObserver;

	const updateDimensions = (entries: ResizeObserverEntry[]) => {
		for (const entry of entries) {
			const { width } = entry.contentRect;
			containerWidth = Math.min(width, container.parentElement?.clientWidth ?? width);
			containerHeight = Math.round(containerWidth * 0.5);
		}
	};

	onMount(() => {
		if (data.error) {
			dispatchToast({ type: 'error', message: data.error });
		} else if (data && data.stockData) {
			try {
				fillChartData(data);
			} catch (err) {
				dispatchToast({ type: 'error', message: 'Error initializing chart' });
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

	let stockData: StockData[];
	let volumeData: VolumeData[];
	let stockTickInput: string = 'AAPL';
	let stockTick: string;
	let chartSeries: ISeriesApi<'Candlestick'> | null = null;
	let volumeSeries: ISeriesApi<'Histogram'> | null = null;
	let lineSeries: ISeriesApi<'Line'> | null = null;

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
		stockTick = data.stockData.ticker;
		stockData = stock;
		volumeData = volume;
		await tick();
		if (!chartSeries || !volumeSeries) {
			return;
		}
		chartSeries.setData(stockData);
		volumeSeries.setData(volumeData);
	};
	const handleCandlestickSeriesReference = (ref: ISeriesApi<'Candlestick'> | null) => {
		chartSeries = ref;
	};

	const handleVolumeSeriesReference = (ref: ISeriesApi<'Histogram'> | null) => {
		volumeSeries = ref;
	};

	const handleLineSeriesReference = (ref: ISeriesApi<'Line'> | null) => {
		lineSeries = ref;
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

	let waterMarkText: string = `${stockTickInput.toUpperCase()} 1D`;
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

	const {
		calcStopLossPerc,
		calcStopLossAmt,
		calcPositionSize,
		calcPositionAmt,
		calcProfitPerc,
		calcRewardPerc,
		calcRewardToRisk
	} = calculator;

	let accSize: number = 1000000;
	let entry: number = 100;
	let stop: number = 96;
	let target: number = 120;
	let risk: number = 0.3;
	let stopLossAmt: number = 300;
	let stopLossPerc: number = 0.004;
	let positionAmt: number = 0;
	let positionSize: number = 0;
	let profit: number = 0;
	let accGrowth: number = 0;
	let riskReward: number = 0;
	let stockTickInputValid: boolean = false;

	const handleStockTickInput = (event: Event) => {
		const input = (event.target as HTMLInputElement).value;
		stockTickInputValid = input.length > 0 && /^[A-Za-z]+$/.test(input);
	};

	$: {
		stopLossPerc = calcStopLossPerc(entry, stop);
		positionSize = calcPositionSize(risk / 100, stopLossPerc);
		positionAmt = calcPositionAmt(accSize, positionSize, entry);
		stopLossAmt = calcStopLossAmt(entry, stop, positionAmt);
		profit = calcProfitPerc(target, entry);
		accGrowth = calcRewardPerc(profit, positionSize);
		riskReward = calcRewardToRisk(risk / 100, accGrowth);
		stockTickInputValid = stockTickInput.length > 0;
	}
</script>

<svelte:head>
	<title>Trade Up - Stock Calculator</title>
	<meta
		name="description"
		content="Calculate optimal position sizes and risk management parameters for your trades."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl">
	<div class="mb-8">
		<h1 class="text-center">Stock Calculator</h1>
		<p class="mt-2 text-center text-base-content/60">
			Calculate position sizes and analyze risk/reward ratios for your trades
		</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-2">
		<div class="space-y-6">
			<div class="card bg-base-100 p-6 shadow-lg">
				<h2 class="mb-6 text-2xl font-bold">Position Calculator</h2>
				<div class="grid gap-6 sm:grid-cols-2">
					<label class="form-control w-full">
						<div class="label">
							<span class="label-text font-medium">Account Size</span>
						</div>
						<div class="relative">
							<span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">$</span>
							<input
								type="number"
								bind:value={accSize}
								class="input input-bordered w-full pl-8"
								placeholder="Enter account size"
							/>
						</div>
					</label>

					<label class="form-control w-full">
						<div class="label">
							<span class="label-text font-medium">Risk Percentage</span>
						</div>
						<div class="relative">
							<input
								type="number"
								bind:value={risk}
								step="0.1"
								class="input input-bordered w-full pr-8"
								placeholder="Enter risk %"
							/>
							<span class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50">%</span>
						</div>
					</label>

					<label class="form-control w-full">
						<div class="label">
							<span class="label-text font-medium">Entry Price</span>
						</div>
						<div class="relative">
							<span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">$</span>
							<input
								type="number"
								bind:value={entry}
								class="input input-bordered w-full pl-8"
								placeholder="Enter entry price"
							/>
						</div>
					</label>

					<label class="form-control w-full">
						<div class="label">
							<span class="label-text font-medium">Stop Loss</span>
						</div>
						<div class="relative">
							<span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">$</span>
							<input
								type="number"
								bind:value={stop}
								class="input input-bordered w-full pl-8"
								placeholder="Enter stop loss"
							/>
						</div>
					</label>

					<label class="form-control w-full">
						<div class="label">
							<span class="label-text font-medium">Target Price</span>
						</div>
						<div class="relative">
							<span class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">$</span>
							<input
								type="number"
								bind:value={target}
								class="input input-bordered w-full pl-8"
								placeholder="Enter target price"
							/>
						</div>
					</label>

					<label class="form-control w-full">
						<div class="label">
							<span class="label-text font-medium">Stock Symbol</span>
						</div>
						<div class="relative">
							<input
								type="text"
								bind:value={stockTickInput}
								class="input input-bordered w-full"
								placeholder="Enter stock symbol"
								on:input={handleStockTickInput}
							/>
							{#if stockTickInputValid}
								<span class="absolute right-3 top-1/2 -translate-y-1/2 text-success">
									<i class="fas fa-check"></i>
								</span>
							{/if}
						</div>
					</label>
				</div>
			</div>

			<div class="card bg-base-100 p-6 shadow-lg">
				<h3 class="mb-4 text-xl font-bold">Results</h3>
				<CalculatorResults input={{ risk, entry, stop, target, stopLossPerc }} />
			</div>
		</div>

		<div class="card flex flex-col bg-base-100 p-6 shadow-lg" bind:this={container}>
			<div class="mb-6 flex items-center justify-between">
				<h3 class="text-xl font-bold">Market Data</h3>
				{#if stockTickInputValid}
					<div class="badge badge-primary">{stockTickInput.toUpperCase()}</div>
				{/if}
			</div>
			<div class="relative w-full">
				<Chart {...chartOptions} {watermark} {...THEMES[$darkTheme ? 'Dark' : 'Light'].chart}>
					<CandlestickSeries
						bind:data={stockData}
						lastValueVisible={true}
						title={stockTick}
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
			</div>
		</div>
	</div>
</div>
