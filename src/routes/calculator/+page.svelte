<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount, tick } from 'svelte';

	import { dispatchToast, darkTheme } from '../stores';
	import type { StockData, VolumeData } from '$lib/types/chartTypes';
	import CalculatorResults from '$lib/components/CalculatorResults.svelte';
	import calculator from '$lib/calculator/calculator';

	import { Chart, CandlestickSeries, HistogramSeries, PriceScale } from 'svelte-lightweight-charts';
	import { ColorType, CrosshairMode, type ISeriesApi } from 'lightweight-charts';
	import { Search } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let containerWidth = $state(600);
	let containerHeight = $state(300);
	let container: HTMLDivElement | undefined = $state();
	let resizeObserver: ResizeObserver;

	const updateDimensions = (entries: ResizeObserverEntry[]) => {
		for (const entry of entries) {
			const { width } = entry.contentRect;
			containerWidth = Math.min(width, container?.parentElement?.clientWidth ?? width);
			containerHeight = Math.round(containerWidth * 0.5);
		}
	};

	onMount(() => {
		if (data.error) {
			dispatchToast({ type: 'error', message: data.error.message });
		} else if (data && data.stockData) {
			try {
				fillChartData(data);
			} catch {
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

	let stockData: StockData[] = $state([]);
	let volumeData: VolumeData[] = $state([]);
	let stockTickInput: string = $state('AAPL');
	let stockTick: string = $derived(stockTickInput.toUpperCase());
	let chartSeries: ISeriesApi<'Candlestick'> | null = null;
	let volumeSeries: ISeriesApi<'Histogram'> | null = null;
	// let lineSeries: ISeriesApi<'Line'> | null = null;

	const fillChartData = async (data: PageData | ActionData) => {
		if (!data?.stockData) {
			dispatchToast({ type: 'error', message: 'No data found' });
			return;
		}
		let volume: VolumeData[] = [];
		let prevClose = 0;
		data.volumeData.forEach((item, idx) => {
			const close = data.stockData[idx].close;
			volume = [
				...volume,
				{
					...item,
					color: prevClose < close ? 'rgba(0, 150, 136, 0.8)' : 'rgba(255,82,82, 0.8)'
				}
			];
			prevClose = close;
		});
		stockData = data.stockData;
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

	// const handleLineSeriesReference = (ref: ISeriesApi<'Line'> | null) => {
	// 	lineSeries = ref;
	// };

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

	let waterMarkText: string = $derived(`${stockTickInput.toUpperCase()} 1D`);
	let watermark = $derived({
		visible: true,
		fontSize: 48,
		horzAlign: 'center' as const,
		vertAlign: 'center' as const,
		color: 'rgba(171, 71, 188, 0.15)',
		text: waterMarkText
	});

	let chartOptions = $derived({
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
	});

	const {
		calcStopLossPerc,
		calcStopLossAmt,
		calcPositionSize,
		calcPositionAmt,
		calcProfitPerc,
		calcRewardPerc,
		calcRewardToRisk
	} = calculator;

	let accSize: number = $state(1000000);
	let entry: number = $state(100);
	let stop: number = $state(96);
	let target: number = $state(120);
	let risk: number = $state(0.3);
	// let stopLossPerc: number = $state(0.004);
	// let positionSize: number = $state(0);
	// let positionAmt: number = $state(0);
	// let stopLossAmt: number = $state(300);
	// let profit: number = $state(0);
	// let accGrowth: number = $state(0);
	// let riskReward: number = $state(0);
	// let stockTickInputValid: boolean = $state(false);
	let stopLossPerc = $derived(calcStopLossPerc(entry, stop));
	let positionSize = $derived(calcPositionSize(risk / 100, stopLossPerc));
	let positionAmt = $derived(calcPositionAmt(accSize, positionSize, entry));
	let stopLossAmt = $derived(calcStopLossAmt(entry, stop, positionAmt));
	let profit = $derived(calcProfitPerc(target, entry));
	let accGrowth = $derived(calcRewardPerc(profit, positionSize));
	let riskReward = $derived(calcRewardToRisk(risk / 100, accGrowth));
	let stockTickInputValid = $derived(stockTickInput.length > 0);

	// $effect(() => {
	// 	stopLossPerc = calcStopLossPerc(entry, stop);
	// 	positionSize = calcPositionSize(risk / 100, stopLossPerc);
	// 	positionAmt = calcPositionAmt(accSize, positionSize, entry);
	// 	stopLossAmt = calcStopLossAmt(entry, stop, positionAmt);
	// 	profit = calcProfitPerc(target, entry);
	// 	accGrowth = calcRewardPerc(profit, positionSize);
	// 	riskReward = calcRewardToRisk(risk / 100, accGrowth);
	// 	stockTickInputValid = stockTickInput.length > 0;
	// });
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

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<div class="card bg-base-100 p-6 shadow-lg">
			<div class="mb-6">
				<form
					method="POST"
					action="?/fetchStockData"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'error') {
								dispatchToast({ type: 'error', message: result.error.message });
							} else if (result.type === 'success' && result.data) {
								await update({ reset: false });
								fillChartData(result.data as ActionData);
							} else if (result.type === 'failure') {
								dispatchToast({ type: 'error', message: String(result.data?.message) });
							} else {
								dispatchToast({ type: 'error', message: 'An unexpected error occurred' });
							}
							stockTickInput = '';
						};
					}}
					class="relative"
				>
					<div class="form-control">
						<label class="label" for="ticker">
							<span class="label-text font-medium">Stock Ticker</span>
						</label>
						<div class="flex justify-center gap-2">
							<input
								type="text"
								id="ticker"
								name="ticker"
								bind:value={stockTickInput}
								class="input input-bordered flex-1"
								placeholder="Enter ticker symbol (e.g., AAPL)"
							/>
							<button class="btn btn-primary" type="submit" disabled={!stockTickInputValid}>
								<Search class="h-5 w-5" />
							</button>
						</div>
					</div>
				</form>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="form-control">
					<label class="label" for="accSize">
						<span class="label-text font-medium">Account Size (USD)</span>
					</label>
					<input type="number" id="accSize" bind:value={accSize} class="input input-bordered" />
				</div>

				<div class="form-control">
					<label class="label" for="risk">
						<span class="label-text font-medium">Risk (%)</span>
					</label>
					<input
						type="number"
						id="risk"
						bind:value={risk}
						class="input input-bordered"
						step="0.1"
					/>
				</div>

				<div class="form-control">
					<label class="label" for="entry">
						<span class="label-text font-medium">Entry Price</span>
					</label>
					<input
						type="number"
						id="entry"
						bind:value={entry}
						class="input input-bordered"
						step="0.01"
					/>
				</div>

				<div class="form-control">
					<label class="label" for="stop">
						<span class="label-text font-medium">Stop Loss</span>
					</label>
					<input
						type="number"
						id="stop"
						bind:value={stop}
						class="input input-bordered"
						step="0.01"
					/>
				</div>

				<div class="form-control">
					<label class="label" for="target">
						<span class="label-text font-medium">Target Price</span>
					</label>
					<input
						type="number"
						id="target"
						bind:value={target}
						class="input input-bordered"
						step="0.01"
					/>
				</div>
			</div>

			<div class="divider my-6"></div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title">Stop Loss</div>
					<div class="stat-value text-xl">
						${stopLossAmt.toFixed(2)}
					</div>
					<div class="stat-desc">
						{(stopLossPerc * 100).toFixed(2)}%
					</div>
				</div>

				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title">Position Size</div>
					<div class="stat-value text-xl">
						{positionAmt} shares
					</div>
					<div class="stat-desc">
						{(positionSize * 100).toFixed(2)}% of account
					</div>
				</div>

				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title">Potential Profit</div>
					<div class="stat-value text-xl text-success">
						{(profit * 100).toFixed(2)}%
					</div>
					<div class="stat-desc">
						Account growth: {(accGrowth * 100).toFixed(2)}%
					</div>
				</div>

				<div class="stat rounded-box bg-base-200 p-4">
					<div class="stat-title">Risk/Reward</div>
					<div class="stat-value text-xl">
						{riskReward.toFixed(2)}
					</div>
					<div class="stat-desc">Higher is better</div>
				</div>
			</div>
		</div>

		<div class="card flex flex-col bg-base-100 p-4 shadow-lg sm:p-6" bind:this={container}>
			<CalculatorResults input={{ risk, entry, stop, target, stopLossPerc }} />
			<div class="divider my-6"></div>
			<div class="relative w-full px-2">
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
