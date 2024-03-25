<script lang="ts">
	import { Chart, CandlestickSeries, HistogramSeries } from 'svelte-lightweight-charts';
	import { ColorType, CrosshairMode, type ISeriesApi } from 'lightweight-charts';
	import { theme } from './stores.js';
	import type { HistogramSeriesProps } from 'svelte-lightweight-charts';

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
		if (data) {
			for (const item of Object.keys(data)) {
				stockData.push({
					time: item,
					open: data[item]['1. open'],
					high: data[item]['2. high'],
					low: data[item]['3. low'],
					close: data[item]['4. close']
				});
				volume?.update({
					time: item,
					value: data[item]['5. volume']
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
	let stockTickInput = 'AAPL';
	let stockTick = 'AAPL';
	const fetchTicker = () => {
		stockTick = stockTickInput.toUpperCase();
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
		width: 350,
		height: 250,
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
		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>
							<label>
								<input type="checkbox" class="checkbox" />
							</label>
						</th>
						<th>Name</th>
						<th>Job</th>
						<th>Favorite Color</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>
							<label>
								<input type="checkbox" class="checkbox" />
							</label>
						</th>
						<td>
							<div class="flex items-center gap-3">
								<div>
									<div class="font-bold">Hart Hagerty</div>
									<div class="text-sm opacity-50">United States</div>
								</div>
							</div>
						</td>
						<td>
							Zemlak, Daniel and Leannon
							<br />
							<span class="badge badge-ghost badge-sm">Desktop Support Technician</span>
						</td>
						<td>Purple</td>
						<th>
							<button class="btn btn-ghost btn-xs">details</button>
						</th>
					</tr>
					<tr>
						<th>
							<label>
								<input type="checkbox" class="checkbox" />
							</label>
						</th>
						<td>
							<div class="flex items-center gap-3">
								<div>
									<div class="font-bold">Brice Swyre</div>
									<div class="text-sm opacity-50">China</div>
								</div>
							</div>
						</td>
						<td>
							Carroll Group
							<br />
							<span class="badge badge-ghost badge-sm">Tax Accountant</span>
						</td>
						<td>Red</td>
						<th>
							<button class="btn btn-ghost btn-xs">details</button>
						</th>
					</tr>
					<tr>
						<th>
							<label>
								<input type="checkbox" class="checkbox" />
							</label>
						</th>
						<td>
							<div class="flex items-center gap-3">
								<div>
									<div class="font-bold">Marjy Ferencz</div>
									<div class="text-sm opacity-50">Russia</div>
								</div>
							</div>
						</td>
						<td>
							Rowe-Schoen
							<br />
							<span class="badge badge-ghost badge-sm">Office Assistant I</span>
						</td>
						<td>Crimson</td>
						<th>
							<button class="btn btn-ghost btn-xs">details</button>
						</th>
					</tr>
					<tr>
						<th>
							<label>
								<input type="checkbox" class="checkbox" />
							</label>
						</th>
						<td>
							<div class="flex items-center gap-3">
								<div>
									<div class="font-bold">Yancy Tear</div>
									<div class="text-sm opacity-50">Brazil</div>
								</div>
							</div>
						</td>
						<td>
							Wyman-Ledner
							<br />
							<span class="badge badge-ghost badge-sm">Community Outreach Specialist</span>
						</td>
						<td>Indigo</td>
						<th>
							<button class="btn btn-ghost btn-xs">details</button>
						</th>
					</tr>
				</tbody>
				<!-- <tfoot>
					<tr>
						<th></th>
						<th>Name</th>
						<th>Job</th>
						<th>Favorite Color</th>
						<th></th>
					</tr>
				</tfoot> -->
			</table>
		</div>
		<div>
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
