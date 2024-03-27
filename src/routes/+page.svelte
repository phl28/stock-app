<script lang="ts">
	import { Chart, CandlestickSeries, HistogramSeries } from 'svelte-lightweight-charts';
	import { ColorType, CrosshairMode, type ISeriesApi } from 'lightweight-charts';
	import { theme } from './stores.js';
	import type { HistogramSeriesProps } from 'svelte-lightweight-charts';
	import { convertUnixTimestampToDate } from '$lib/helpers/DataHelpers.js';

	export let data;
	interface StockData {
		time: string;
		open: number;
		high: number;
		low: number;
		close: number;
	}
	let stockData: StockData[] = [];
	let volume: ISeriesApi<'Histogram'> | null = null;
	$: {
		if (data.results) {
			for (const item of data.results) {
				const date = convertUnixTimestampToDate(item.t);
				console.log(item.t);
				console.log(date);
				stockData.push({
					time: date,
					open: item.o,
					high: item.h,
					low: item.l,
					close: item.c
				});
				volume?.update({
					time: date,
					value: item.v
				});
			}
		}
	}

	let volumeProps: HistogramSeriesProps = {
		color: '#26a69a',
		priceFormat: {
			type: 'volume'
		},
		priceScaleId: 'volume',
		data: [...(volume ?? [])],
		ref: (ref: ISeriesApi<'Histogram'> | null) => (volume = ref)
	};
	function handleVolumeComponentReference(ref: ISeriesApi<'Histogram'> | null): void {
		volume = ref;
	}
	let stockTickInput: string = 'AAPL';
	let stockTick: string = 'AAPL';
	const fetchTicker = () => {
		stockTick = stockTickInput.toUpperCase();
	};
	let accSize: number;
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
				watermark: {
					color: 'rgba(0, 0, 0, 0)'
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
				watermark: {
					color: 'rgba(0, 0, 0, 0)'
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

	const chartOptions = {
		width: 400,
		height: 300,
		crosshair: {
			mode: CrosshairMode.Magnet
		},
		rightPriceScale: {
			borderColor: 'rgba(197, 203, 206, 0.8)'
		},
		timeScale: {
			borderColor: 'rgba(197, 203, 206, 0.8)'
		},
		waterMark: {
			visible: true,
			text: `${stockTick} 1D`
		}
	};
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
		<div class="flex flex-col overflow-x-auto">
			<form method="GET" action="/">
				<label class="form-control mb-5 w-full max-w-xs">
					<div class="label">
						<span class="label-text">Enter the stock ticker</span>
					</div>
					<div class="flex">
						<input
							type="text"
							name="ticker"
							bind:value={stockTickInput}
							class="input input-bordered me-2 w-full max-w-xs"
						/>
						<button class="btn btn-primary" on:click={fetchTicker}>Submit</button>
					</div>
				</label>
			</form>
			<label class="input input-bordered flex items-center gap-2">
				Account Size
				<input type="number" class="grow" placeholder="1000000" bind:value={accSize} />
			</label>
			<label class="input input-bordered flex items-center gap-4">
				Risk
				<input type="text" class="grow" placeholder="0.03%" />
			</label>
			<label class="input input-bordered flex items-center gap-2">
				<input type="text" class="grow" placeholder="Search" />
				<kbd class="kbd kbd-sm">⌘</kbd>
				<kbd class="kbd kbd-sm">K</kbd>
			</label>
			<label class="input input-bordered flex items-center gap-2">
				<input type="text" class="grow" placeholder="Search" />
				<span class="badge badge-info">Optional</span>
			</label>
		</div>
		<div>
			<Chart {...chartOptions} {...THEMES[$theme ? 'Dark' : 'Light'].chart}>
				<CandlestickSeries
					data={stockData}
					lastValueVisible={true}
					title={stockTick}
					priceLineVisible={true}
					upColor="rgb(11, 153, 129)"
					downColor="rgb(209,57,70)"
				/>
				<HistogramSeries {...volumeProps} ref={handleVolumeComponentReference} />
			</Chart>
		</div>
	</div>
</section>
