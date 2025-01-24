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
	import { dispatchToast, darkTheme } from '../../stores.ts';
	import type { StockData, VolumeData } from '@/lib/types/chartTypes.ts';
	import { convertUnixTimestampToDate, formatDuration } from '@/lib/helpers/DataHelpers.ts';
	import { onMount, tick } from 'svelte';
	import { ArrowDown, ArrowUp, CheckCheck, EllipsisVertical } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { formatCurrency } from '@/lib/helpers/CurrencyHelpers.ts';
	import Editor from '@/lib/components/Editor.svelte';
	import Grid from '@/lib/components/Grid.svelte';
	import type { GridOptions } from 'ag-grid-community';

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

	const handleEditPositionButtonClicked = () => {
		const modal = document.getElementById('editPositionModal') as HTMLDialogElement;
		modal.showModal();
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

	interface IRow {
		make: string;
		model: string;
		price: number;
		electric: boolean;
	}

	const gridOptions: GridOptions<IRow> = {
		rowData: [
			{ make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
			{ make: 'Ford', model: 'F-Series', price: 33850, electric: false },
			{ make: 'Toyota', model: 'Corolla', price: 29600, electric: false }
		],
		columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }, { field: 'electric' }]
	};
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
						<button on:click={handleEditPositionButtonClicked}>Edit Position</button>
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
		<div class="relative flex w-3/5 flex-col px-2" bind:this={container}>
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
		<div class="relative w-2/5 px-2">
			<Grid {gridOptions} isDarkMode={$darkTheme} />
		</div>
	</div>

	<dialog id="editPositionModal" class="modal">
		<div class="modal-box max-w-5xl">
			<h3 class="text-lg font-bold">Edit Position</h3>
			<div class="flex justify-between">
				<div class="flex flex-grow flex-col">
					<div class="flex">
						<label class="label flex cursor-pointer flex-col items-start gap-1">
							<span class="label-text">Ticker</span>
							<input
								id="ticker"
								type="text"
								disabled
								class="input input-bordered w-full"
								value={data.position?.ticker}
							/>
						</label>
						<label class="label flex cursor-pointer flex-col items-start gap-1">
							<span class="label-text">Platform</span>
							<input
								id="ticker"
								type="text"
								disabled
								class="input input-bordered w-full"
								value={data.position?.platform}
							/>
						</label>
					</div>
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>Date</th>
									<th>Time</th>
									<th>Direction</th>
									<th>Quantity</th>
									<th>Price</th>
									<th>Fees</th>
								</tr>
							</thead>
							<tbody>
								{#if data.trades}
									{#each data.trades as trade, rowIndex}
										<tr>
											<td>{new Date(trade.executedAt ?? '').toLocaleDateString()}</td>
											<td>{new Date(trade.executedAt ?? '').toLocaleTimeString()}</td>
											<td
												on:dblclick={(e) => {
													e.preventDefault();
													startEditing(rowIndex, 'tradeTradeSide', trade.tradeSide ?? 'BUY');
												}}
											>
												{#if editingState(rowIndex, 'tradeTradeSide')}
													<select
														class="select select-bordered select-sm w-full"
														bind:value={editValue}
														on:blur={() => saveEdit(trade)}
														on:keydown={(e) => handleKeyDown(e, trade)}
													>
														<option value="BUY">BUY</option>
														<option value="SELL">SELL</option>
													</select>
												{:else}
													{trade.tradeSide}
												{/if}
											</td>
											<td
												on:dblclick={() => startEditing(rowIndex, 'tradeVolume', trade.volume ?? 0)}
											>
												{#if editingState(rowIndex, 'tradeVolume')}
													<input
														type="number"
														class="input input-sm input-bordered w-full"
														bind:value={editValue}
														on:blur={() => saveEdit(trade)}
														on:keydown={(e) => handleKeyDown(e, trade)}
													/>
												{:else}
													{trade.volume}
												{/if}
											</td>
											<td
												on:dblclick={() => startEditing(rowIndex, 'tradePrice', trade.price ?? 0)}
											>
												{#if editingState(rowIndex, 'tradePrice')}
													<input
														type="number"
														class="input input-sm input-bordered w-full"
														bind:value={editValue}
														step="0.01"
														on:blur={() => saveEdit(trade)}
														on:keydown={(e) => handleKeyDown(e, trade)}
													/>
												{:else}
													{formatCurrency(
														trade.price,
														data.position?.region === 'US' ? 'USD' : 'HKD'
													)}
												{/if}
											</td>
											<td on:dblclick={() => startEditing(rowIndex, 'tradeFees', trade.fees ?? 0)}>
												{#if editingState(rowIndex, 'tradeFees')}
													<input
														type="number"
														class="input input-sm input-bordered w-full"
														bind:value={editValue}
														step="0.01"
														on:blur={() => saveEdit(trade)}
														on:keydown={(e) => handleKeyDown(e, trade)}
													/>
												{:else}
													{formatCurrency(
														trade.fees,
														data.position?.region === 'US' ? 'USD' : 'HKD'
													)}
												{/if}
											</td>
										</tr>
									{/each}
								{/if}
							</tbody>
						</table>
					</div>
				</div>
				<div class="divider divider-horizontal"></div>
				<div class="flex flex-col">
					<h4>Position Details</h4>
					<p>Direction: {data.position?.isShort ? 'Short' : 'Long'}</p>
					<p>Total Quantity: {data.position?.totalVolume}</p>
					<p>Outstanding Quantity: {data.position?.outstandingVolume}</p>
					<p>Gross P/L: {data.position?.grossProfitLoss}</p>
					<p>
						Net P/L: {Number(data.position?.grossProfitLoss) - Number(data.position?.totalFees)}
					</p>
					<p>Average Entry Price: {data.position?.averageEntryPrice}</p>
					<p>Average Exit Price: {data.position?.averageExitPrice}</p>
					<p>
						Duration: {formatDuration(
							new Date(data.trades?.at(0)?.executedAt ?? ''),
							new Date(data.trades?.at(-1)?.executedAt ?? '')
						)}
					</p>
				</div>
			</div>
			<div class="modal-action">
				<form method="dialog">
					<button class="btn">Close</button>
				</form>
				<button class="btn btn-primary" type="submit">Save</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
</section>
