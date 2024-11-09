<script lang="ts">
	import { Chart, CandlestickSeries, HistogramSeries, PriceScale } from 'svelte-lightweight-charts';
	import { ColorType, CrosshairMode, type ISeriesApi } from 'lightweight-charts';
	import { dispatchToast, theme } from './stores.ts';
	import { convertUnixTimestampToDate } from '$lib/helpers/DataHelpers';
	import { enhance } from '$app/forms';
	import type { StockData, VolumeData } from '$lib/types/chartTypes';
	import CalculatorResults from '$lib/components/CalculatorResults.svelte';
	import calculator from '$lib/calculator/calculator';
	import { onMount, tick } from 'svelte';

	export let data;
	let containerWidth = 600;
	let containerHeight = 300;
	let container: HTMLDivElement;
	let resizeObserver: ResizeObserver;

	const updateDimensions = (entries: ResizeObserverEntry[]) => {
		for (const entry of entries) {
			const { width } = entry.contentRect;
			containerWidth = width;
			console.log('containerWidth', containerWidth);
			containerHeight = Math.round(width * 0.5); // 60% of width
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
			containerWidth = container.clientWidth;
			containerHeight = Math.round(containerWidth * 0.6);

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
					background: {
						type: ColorType.Solid,
						color: '#1D232A'
					},
					lineColor: '#2B2B43',
					textColor: '#D9D9D9'
				},
				grid: {
					vertLines: {
						color: '#2B2B43'
					},
					horzLines: {
						color: '#363C4E'
					}
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
					background: {
						type: ColorType.Solid,
						color: '#FFFFFF'
					},
					lineColor: '#2B2B43',
					textColor: '#191919'
				},
				grid: {
					vertLines: {
						visible: false
					},
					horzLines: {
						color: '#f0f3fa'
					}
				}
			},
			series: {
				topColor: 'rgba(33, 150, 243, 0.56)',
				bottomColor: 'rgba(33, 150, 243, 0.04)',
				lineColor: 'rgba(33, 150, 243, 1)'
			}
		}
	};

	const watermark = {
		visible: true,
		text: `${stockTickInput.toUpperCase()} 1D`
	};

	$: chartOptions = {
		width: containerWidth,
		height: containerHeight,
		crosshair: {
			mode: CrosshairMode.Magnet
		},
		rightPriceScale: {
			borderColor: 'rgba(197, 203, 206, 0.8)',
			scaleMargins: {
				top: 0.3,
				bottom: 0.25
			}
		},
		timeScale: {
			borderColor: 'rgba(197, 203, 206, 0.8)'
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
	<title>Trade up - #1 Trading Helper</title>
	<meta
		name="description"
		content="Trade Your Equity Curve, allows users to calculate how much of the stock a person should own given the circumstance."
	/>
</svelte:head>

<div class="container">
	<div class="flex w-full flex-col items-center justify-center gap-4 p-4 lg:flex-row lg:gap-10">
		<div class="flex w-full flex-col lg:w-1/3">
			<h1 class="ms-1 {stockTick ? '' : 'hidden'}">{stockTick}</h1>

			<form
				method="POST"
				action="?/fetchStockData"
				use:enhance={() => {
					return async ({ result, update }) => {
						stockTickInput = '';
						if (result.type === 'error') {
							dispatchToast({ type: 'error', message: result.error.message });
						} else if (result.type === 'success') {
							await update({ reset: false });
							fillChartData(result.data);
						} else if (result.type === 'failure') {
							dispatchToast({ type: 'error', message: String(result.data?.message) });
						} else {
							dispatchToast({ type: 'error', message: 'An unexpected error occurred' });
						}
					};
				}}
			>
				<label class="form-control mb-5 w-full">
					<div class="label">
						<span class="label-text">Enter the stock ticker</span>
					</div>
					<div class="flex">
						<input
							type="text"
							name="ticker"
							bind:value={stockTickInput}
							class="input input-sm input-bordered me-2 w-full"
						/>
						<button class="btn btn-primary btn-sm" type="submit" disabled={!stockTickInputValid}
							>Submit</button
						>
					</div>
				</label>
			</form>
			<div class="mb-4 w-full space-y-1">
				<label class="input input-sm input-bordered flex items-center justify-between gap-2">
					<span class="whitespace-nowrap">Account Size (USD)</span>
					<input type="number" bind:value={accSize} class="w-1/2 text-right" />
				</label>
				<label class="input input-sm input-bordered flex items-center gap-2">
					<span>Risk</span>
					<input type="text" bind:value={risk} class="flex-1 text-right" />
					<span>%</span>
				</label>
			</div>
			<div class="w-full space-y-1">
				<label class="input input-sm input-bordered flex items-center gap-2">
					<span>Entry</span>
					<input type="number" bind:value={entry} class="flex-1 text-right" />
				</label>
				<label class="input input-sm input-bordered flex items-center gap-2">
					<span>Stop</span>
					<input type="number" bind:value={stop} class="flex-1 text-right" />
				</label>
				<label class="input input-sm input-bordered flex items-center gap-2">
					<span>Target</span>
					<input type="number" bind:value={target} class="flex-1 text-right" />
				</label>
			</div>
			<div class="w-full space-y-1">
				<div class="input input-sm flex items-center gap-2">
					<strong>Stop Loss:</strong>
					<span class="flex-1 text-right">
						{stopLossAmt.toFixed(2)} ({(stopLossPerc * 100).toFixed(2)}%)
					</span>
				</div>
				<div class="input input-sm flex items-center gap-2">
					<strong>Position Amount:</strong>
					<span class="flex-1 text-right">{positionAmt}</span>
				</div>
				<div class="input input-sm flex items-center gap-2">
					<strong>Position Size:</strong>
					<span class="flex-1 text-right">{(positionSize * 100).toFixed(2)}%</span>
				</div>
				<div class="input input-sm flex items-center gap-2">
					<strong>Profit:</strong>
					<span class="flex-1 text-right">{(profit * 100).toFixed(2)}%</span>
				</div>
				<div class="input input-sm flex items-center gap-2">
					<strong>Account Growth:</strong>
					<span class="flex-1 text-right">{(accGrowth * 100).toFixed(2)}%</span>
				</div>
				<div class="input input-sm flex items-center gap-2">
					<strong>Reward / Risk:</strong>
					<span class="flex-1 text-right">{riskReward.toFixed(2)}</span>
				</div>
			</div>
		</div>
		<div class="flex w-full flex-col lg:w-2/3" bind:this={container}>
			<div class="z-0 w-full grow">
				<Chart {...chartOptions} {watermark} {...THEMES[$theme ? 'Dark' : 'Light'].chart}>
					<CandlestickSeries
						bind:data={stockData}
						lastValueVisible={true}
						title={stockTick}
						priceLineVisible={true}
						upColor="rgb(11, 153, 129)"
						downColor="rgb(209,57,70)"
						ref={handleCandlestickSeriesReference}
					/>
					<HistogramSeries
						bind:data={volumeData}
						priceScaleId="volume"
						color="#26a69a"
						priceFormat={{ type: 'volume' }}
						ref={handleVolumeSeriesReference}
					/>
					<PriceScale id="volume" scaleMargins={{ top: 0.8, bottom: 0 }} />
				</Chart>
			</div>
			<CalculatorResults
				input={{ risk: risk, entry: entry, stop: stop, target: target, stopLossPerc: stopLossPerc }}
			/>
		</div>
	</div>
</div>
