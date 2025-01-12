<script lang="ts">
	import { Chart, CandlestickSeries, HistogramSeries, PriceScale } from 'svelte-lightweight-charts';
	import { ColorType, CrosshairMode, type ISeriesApi } from 'lightweight-charts';
	import type { PageData } from './$types';
	import { dispatchToast, theme } from '../../stores.ts';
	import type { StockData, VolumeData } from '@/lib/types/chartTypes.ts';
	import { convertUnixTimestampToDate } from '@/lib/helpers/DataHelpers.ts';
	import { onMount, tick } from 'svelte';
	import { CheckCheck, EllipsisVertical } from 'lucide-svelte';

	export let data: PageData;

	let chartSeries: ISeriesApi<'Candlestick'> | null = null;
	let volumeSeries: ISeriesApi<'Histogram'> | null = null;
	//  only used when there are SMA data
	let lineSeries: ISeriesApi<'Line'> | null = null;

	let container: HTMLDivElement;
	let containerWidth = 600;
	let containerHeight = 300;
	let resizeObserver: ResizeObserver;

	onMount(() => {
		if (data && data.stockData) {
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

	const updateDimensions = (entries: ResizeObserverEntry[]) => {
		for (const entry of entries) {
			const { width } = entry.contentRect;
			containerWidth = Math.min(width, container.parentElement?.clientWidth ?? width);
			containerHeight = Math.round(containerWidth * 0.5);
		}
	};

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

	let waterMarkText: string = `${data.position[0].ticker} 1D`;
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
</script>

<section>
	<div class="mb-4 flex items-center justify-between">
		<h1>{data.position[0].ticker}</h1>
		<div id="top-bar-right" class="flex items-center gap-2">
			<div class="dropdown dropdown-end dropdown-bottom">
				<div tabindex="0" role="button" class="btn m-1"><EllipsisVertical /></div>
				<ul class="menu dropdown-content z-[1000] w-52 rounded-box bg-base-100 p-2 shadow">
					<li class="p-2">Edit Position</li>
					<hr class="my-1" />
					<li class="p-2">Delete Position</li>
				</ul>
			</div>
			<form method="POST" action="?/markPositionReviewed">
				<button
					class="btn btn-primary"
					type="submit"
					disabled={data.position[0].reviewedAt !== null}><CheckCheck /> Mark as reviewed</button
				>
			</form>
		</div>
	</div>
	<div class="relative w-full px-2" bind:this={container}>
		<Chart {...chartOptions} {watermark} {...THEMES[$theme ? 'Dark' : 'Light'].chart}>
			<CandlestickSeries
				bind:data={stockData}
				lastValueVisible={true}
				title={data.position[0].ticker}
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
</section>
