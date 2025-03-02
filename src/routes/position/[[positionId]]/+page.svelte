<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	import { dispatchToast, darkTheme, modalStore } from '@/routes/stores';
	import type { StockData, VolumeData } from '@/lib/types/chartTypes.ts';
	import { formatDuration } from '@/lib/helpers/DataHelpers';
	import { formatCurrency } from '@/lib/helpers/CurrencyHelpers';
	import Editor from '@/lib/components/Editor.svelte';
	import Grid from '@/lib/components/Grid.svelte';
	import type { Position, Trade } from '@/lib/types/tradeTypes.ts';
	import { TradeSideCellRenderer } from '@/lib/components/TradeSideCellRenderer';
	import EditPositionModal from '@/lib/components/EditPositionModal.svelte';

	import { Chart, CandlestickSeries, HistogramSeries, PriceScale } from 'svelte-lightweight-charts';
	import {
		ColorType,
		CrosshairMode,
		LineStyle,
		type IPriceLine,
		type ISeriesApi,
		type SeriesMarker,
		type Time
	} from 'lightweight-charts';
	import { ArrowDown, ArrowUp, CheckCheck, EllipsisVertical } from 'lucide-svelte';
	import {
		colorSchemeDarkBlue,
		themeQuartz,
		type GetRowIdParams,
		type GridApi,
		type GridOptions
	} from 'ag-grid-community';

	export let data: PageData;

	let isCalculatingRR = false;

	let chartSeries: ISeriesApi<'Candlestick'> | null = null;
	let volumeSeries: ISeriesApi<'Histogram'> | null = null;
	//  only used when there are SMA data
	// let lineSeries: ISeriesApi<'Line'> | null = null;
	let avgEntryPriceLine: IPriceLine | undefined = undefined;
	let avgExitPriceLine: IPriceLine | undefined = undefined;
	let profitTargetPriceLine: IPriceLine | undefined = undefined;
	let stopLossPriceLine: IPriceLine | undefined = undefined;

	let container: HTMLDivElement;
	let containerWidth = 600;
	let containerHeight = 300;
	let resizeObserver: ResizeObserver;

	function debounce<Args extends unknown[], ReturnType>(
		func: (...args: Args) => ReturnType,
		wait: number
	): (...args: Args) => void {
		let timeout: number;
		return (...args: Args) => {
			window.clearTimeout(timeout);
			timeout = window.setTimeout(() => func(...args), wait);
		};
	}

	onMount(() => {
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
				} catch {
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

	const fillChartData = async (data: PageData) => {
		if (!data.stockData) {
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

	const fillPositionData = async (
		position: Position,
		trades: Pick<Trade, 'id' | 'tradeSide' | 'executedAt' | 'volume' | 'price' | 'fees'>[]
	) => {
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

		if (avgEntryPriceLine) chartSeries?.removePriceLine(avgEntryPriceLine);
		if (avgExitPriceLine) chartSeries?.removePriceLine(avgExitPriceLine);
		if (profitTargetPriceLine) chartSeries?.removePriceLine(profitTargetPriceLine);
		if (stopLossPriceLine) chartSeries?.removePriceLine(stopLossPriceLine);

		avgEntryPriceLine = chartSeries?.createPriceLine({
			price: Number(position.averageEntryPrice),
			color: 'green',
			lineWidth: 2,
			lineStyle: LineStyle.Dotted,
			axisLabelVisible: true,
			title: 'Avg Entry'
		});
		if (position.averageExitPrice) {
			avgExitPriceLine = chartSeries?.createPriceLine({
				price: Number(position.averageExitPrice),
				color: 'red',
				lineWidth: 2,
				lineStyle: LineStyle.Dotted,
				axisLabelVisible: true,
				title: 'Avg Exit'
			});
		}
		if (position.profitTargetPrice) {
			profitTargetPriceLine = chartSeries?.createPriceLine({
				price: Number(position.profitTargetPrice),
				color: 'blue',
				lineWidth: 2,
				lineStyle: LineStyle.Dotted,
				axisLabelVisible: true,
				title: 'Target'
			});
		}
		if (position.stopLossPrice) {
			stopLossPriceLine = chartSeries?.createPriceLine({
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

	const handleSaveJournal = async (outputData: object) => {
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
		} catch {
			dispatchToast({ type: 'error', message: 'Failed to delete images' });
		}
	};

	type TradeGrid = Pick<Trade, 'id' | 'tradeSide' | 'executedAt' | 'price' | 'fees' | 'volume'>;
	const gridOptions: GridOptions<TradeGrid> = {
		getRowId: (params: GetRowIdParams<TradeGrid>) => params.data.id.toString(),
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
				valueFormatter: ({ data }) => formatCurrency(data?.price ?? '', 'USD'),
				width: 150
			},
			{
				field: 'fees',
				headerName: 'Fees',
				valueFormatter: ({ data }) => formatCurrency(data?.fees ?? '', 'USD'),
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

	let rR: number | undefined =
		(Number(data.position?.profitTargetPrice) - Number(data.position?.averageEntryPrice)) /
		(Number(data.position?.averageEntryPrice) - Number(data.position?.stopLossPrice));
	let previousRR: number | undefined = rR;
	let stopLossPrice: number | undefined = Number(data.position?.stopLossPrice) || undefined;
	let previousStopLossPrice: number | undefined = stopLossPrice;
	let profitTargetPrice: number | undefined = Number(data.position?.profitTargetPrice) || undefined;
	let previousProfitTargetPrice: number | undefined = profitTargetPrice;

	const updateRiskReward = debounce(async () => {
		if (!data.position) return;
		isCalculatingRR = true;

		if (previousRR !== rR && stopLossPrice && rR) {
			profitTargetPrice =
				(Number(data.position.averageEntryPrice) - stopLossPrice) * rR +
				Number(data.position.averageEntryPrice);
			previousProfitTargetPrice = profitTargetPrice;
		} else if (
			(previousStopLossPrice !== stopLossPrice ||
				previousProfitTargetPrice !== profitTargetPrice) &&
			profitTargetPrice &&
			stopLossPrice
		) {
			rR =
				(Number(profitTargetPrice) - Number(data.position?.averageEntryPrice)) /
				(Number(data.position?.averageEntryPrice) - Number(stopLossPrice));
			previousRR = rR;
		}
		if (browser) {
			fetch('/position/' + data.position.id + '/edit', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					position: { ...data.position, stopLossPrice, profitTargetPrice }
				})
			});
			await invalidateAll();
		}
		isCalculatingRR = false;
	}, 500);
</script>

<section>
	<div class="mb-4 flex items-center justify-between">
		<h1 class="flex items-center gap-2" data-testid="position-page-title">
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
				<div tabindex="0" role="button" class="btn m-1" data-testid="position-dropdown-button">
					<EllipsisVertical />
				</div>
				<ul class="menu dropdown-content z-[1000] w-52 rounded-box bg-base-100 p-2 shadow">
					<li>
						<button on:click={toggleEditPositionModal} data-testid="position-dropdown-edit-button"
							>Edit Position</button
						>
					</li>
					<div class="divider m-0 p-0"></div>
					<li>
						<form
							method="POST"
							action="?/deletePosition"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'success') {
										goto('/trade/1');
										dispatchToast({ type: 'success', message: 'Position deleted successfully!' });
									} else if (result.type === 'error') {
										dispatchToast({ type: 'error', message: result.error.message });
									}
								};
							}}
						>
							<button type="submit" data-testid="position-dropdown-delete-button"
								>Delete Position</button
							>
						</form>
					</li>
				</ul>
			</div>
			<form method="POST" action="?/markPositionReviewed">
				<button
					class="btn btn-primary"
					type="submit"
					disabled={data.position?.reviewedAt !== null}
					data-testid="position-page-mark-reviewed-button"><CheckCheck /> Mark as reviewed</button
				>
			</form>
		</div>
	</div>
	<div class="relative flex w-full gap-2 px-2">
		<div
			class="relative flex w-4/6 flex-col px-2"
			bind:this={container}
			data-testid="position-page-chart-container"
		>
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
						<input
							type="number"
							bind:value={stopLossPrice}
							disabled={isCalculatingRR}
							on:blur={updateRiskReward}
							class="input input-sm input-bordered w-full"
							data-testid="position-page-stop-loss-input"
						/>
					</label>
					<label class="form-control w-full">
						<div class="label">
							<span class="label-text">Profit Target</span>
						</div>
						<input
							type="number"
							bind:value={profitTargetPrice}
							disabled={isCalculatingRR}
							on:blur={updateRiskReward}
							class="input input-sm input-bordered w-full"
							data-testid="position-page-profit-target-input"
						/>
					</label>
					<label class="form-control w-full">
						<div class="label">
							<span class="label-text">R / R Units</span>
						</div>
						<input
							type="number"
							bind:value={rR}
							step="0.01"
							disabled={isCalculatingRR}
							on:blur={updateRiskReward}
							class="input input-sm input-bordered w-full"
							data-testid="position-page-rr-input"
						/>
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
								{data.position?.grossProfitLoss
									? formatCurrency(
											data.position.grossProfitLoss,
											data.position?.region === 'US' ? 'USD' : 'HKD'
										)
									: 'N/A'}
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
								{data.position?.grossProfitLoss
									? formatCurrency(
											String(
												Number(data.position?.grossProfitLoss) - Number(data.position?.totalFees)
											),
											data.position?.region === 'US' ? 'USD' : 'HKD'
										)
									: 'N/A'}
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
								>{data.position?.outstandingVolume === 0
									? formatCurrency(
											data.trades?.at(-1)?.price ?? '',
											data.position?.region === 'US' ? 'USD' : 'HKD'
										)
									: 'N/A'}</span
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
								>{data.position?.averageEntryPrice && Number(data.position.averageExitPrice) > 0
									? formatCurrency(
											data.position.averageExitPrice,
											data.position?.region === 'US' ? 'USD' : 'HKD'
										)
									: 'N/A'}</span
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
