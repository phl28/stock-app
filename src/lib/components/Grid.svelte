<script lang="ts">
	import {
		AllCommunityModule,
		ModuleRegistry,
		createGrid,
		themeQuartz,
		colorSchemeDarkBlue
	} from 'ag-grid-community';
	import type { CellValueChangedEvent, GridApi, GridOptions } from 'ag-grid-community';
	import { createEventDispatcher, onMount } from 'svelte';

	ModuleRegistry.registerModules([AllCommunityModule]);

	const dispatch = createEventDispatcher();

	export let gridOptions: GridOptions;
	export let className: string = '';
	export let style: string = '';
	export let isDarkMode: boolean = false;

	let gridApi: GridApi;
	let gridElement: HTMLElement;

	$: {
		if (gridApi) {
			gridApi.setGridOption(
				'theme',
				isDarkMode ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz
			);
		}
	}

	const defaultOptions: Partial<GridOptions> = {
		theme: isDarkMode ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz,
		defaultColDef: {
			cellStyle: {
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center'
			},
			...gridOptions.defaultColDef
		},
		autoSizeStrategy: {
			type: 'fitCellContents'
		},
		onCellValueChanged: (event: CellValueChangedEvent) => {
			dispatch('cellValueChanged', {
				rowIndex: event.rowIndex,
				colId: event.column.getColId(),
				oldValue: event.oldValue,
				newValue: event.newValue
			});

			if (gridOptions.onCellValueChanged) {
				gridOptions.onCellValueChanged(event);
			}
		}
	};

	const mergedGridOptions: GridOptions = {
		...defaultOptions,
		...gridOptions
	};

	onMount(() => {
		if (gridElement) {
			gridApi = createGrid(gridElement, mergedGridOptions);
			dispatch('gridReady', gridApi);

			return () => {
				if (gridApi) {
					gridApi.destroy();
				}
			};
		}
	});
</script>

<div bind:this={gridElement} class={className} {style} />

<style>
	div {
		width: 100%;
	}
</style>
