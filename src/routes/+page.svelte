<script lang="ts">
	import { Chart, CandlestickSeries, HistogramSeries, PriceScale } from 'svelte-lightweight-charts';
	import { ColorType, CrosshairMode, type ISeriesApi } from 'lightweight-charts';
	import { theme } from './stores.js';
	import { convertUnixTimestampToDate } from '$lib/helpers/DataHelpers.js';
	import { enhance } from '$app/forms';
	import type { StockData, VolumeData } from '$lib/types/chartTypes.js';
	import CalculatorResults from '$lib/components/CalculatorResults.svelte';
	import calculator from '$lib/calculator/calculator';
	import { tick } from 'svelte';

	export let form;
	let stockData: StockData[];
	let volumeData: VolumeData[];
	let stockTickInput: string = 'AAPL';
	let stockTick: string;
	let chartSeries: ISeriesApi<'Candlestick'> | null = null;
	let volumeSeries: ISeriesApi<'Histogram'> | null = null;

	$: {
		if (form) {
			let stock: StockData[] = [];
			let volume: VolumeData[] = [];
			let prevClose = 0;
			for (const item of form.results) {
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
			stockTick = form.ticker;
			stockData = stock;
			volumeData = volume;
			tick().then(() => {
				if (chartSeries) {
					chartSeries.setData(stockData);
				}
				if (volumeSeries) {
					volumeSeries.setData(volumeData);
				}
			});
		}
	}
	function handleCandlestickSeriesReference(ref: ISeriesApi<'Candlestick'> | null) {
		chartSeries = ref;
	}
	function handleVolumeSeriesReference(ref: ISeriesApi<'Histogram'> | null) {
		volumeSeries = ref;
	}

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

	const chartOptions = {
		height: 300,
		width: 600,
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
	$: {
		stopLossPerc = calcStopLossPerc(entry, stop);
		positionSize = calcPositionSize(risk / 100, stopLossPerc);
		positionAmt = calcPositionAmt(accSize, positionSize, entry);
		stopLossAmt = calcStopLossAmt(entry, stop, positionAmt);
		profit = calcProfitPerc(target, entry);
		accGrowth = calcRewardPerc(profit, positionSize);
		riskReward = calcRewardToRisk(risk / 100, accGrowth);
	}
</script>

<svelte:head>
	<title>Trade up - #1 Trading Helper</title>
	<meta
		name="description"
		content="Trade Your Equity Curve, allows users to calculate how much of the stock a person should own given the circumstance."
	/>
</svelte:head>

<section>
	{#if stockTick}
		<h1 class="ms-2">{stockTick}</h1>
	{/if}
	<div class="flex flex-row items-center justify-between">
		<div class="flex flex-col">
			<form method="POST" action="?/fetchStockData" use:enhance>
				<label class="form-control mb-5 w-full max-w-xs">
					<div class="label">
						<span class="label-text">Enter the stock ticker</span>
					</div>
					<div class="flex">
						<input
							type="text"
							name="ticker"
							bind:value={stockTickInput}
							class="input input-sm input-bordered me-2 w-full max-w-xs"
						/>
						<button class="btn btn-primary btn-sm" type="submit">Submit</button>
					</div>
				</label>
			</form>
			<div class="mb-4 space-y-1">
				<label class="input input-sm input-bordered flex items-center gap-4">
					Account Size (USD)
					<input type="number" class="grow" bind:value={accSize} />
				</label>
				<label class="input input-sm input-bordered flex items-center gap-4">
					Risk
					<input type="text" bind:value={risk} class="grow" />
					<span>%</span>
				</label>
			</div>
			<div class="space-y-1">
				<label class="input input-sm input-bordered flex items-center gap-4">
					Entry
					<input type="number" bind:value={entry} class="grow" />
				</label>
				<label class="input input-sm input-bordered flex items-center gap-4">
					Stop
					<input type="number" bind:value={stop} class="grow" />
				</label>
				<label class="input input-sm input-bordered flex items-center gap-4">
					Target
					<input type="number" bind:value={target} class="grow" />
				</label>
			</div>
		</div>
		<div>
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
	</div>
	<div class="flex flex-row items-center justify-between">
		<div>
			<label class="input input-sm flex items-center gap-2">
				<strong>Stop Loss:</strong>
				<input type="number" class="grow" value={stopLossAmt.toFixed(2)} disabled />
				({(stopLossPerc * 100).toFixed(2)} %)
			</label>
			<label class="input input-sm flex items-center gap-2">
				<strong>Position Amount:</strong>
				<input type="text" value={positionAmt} class="grow" disabled />
			</label>
			<label class="input input-sm flex items-center gap-2">
				<strong>Position Size:</strong>
				<input type="text" value={(positionSize * 100).toFixed(2)} class="grow" disabled />
				<span>%</span>
			</label>
			<label class="input input-sm flex items-center gap-2">
				<strong>Profit:</strong>
				<input type="text" value={(profit * 100).toFixed(2)} class="grow" disabled />
				<span>%</span>
			</label>
			<label class="input input-sm flex items-center gap-2">
				<strong>Account Growth:</strong>
				<input type="text" value={(accGrowth * 100).toFixed(2)} class="grow" disabled />
				<span>%</span>
			</label>
			<label class="input input-sm flex items-center gap-2">
				<strong>Reward / Risk:</strong>
				<input type="text" value={riskReward.toFixed(2)} class="grow" disabled />
			</label>
		</div>
		<CalculatorResults
			input={{ risk: risk, entry: entry, stop: stop, target: target, stopLossPerc: stopLossPerc }}
		/>
	</div>
</section>
