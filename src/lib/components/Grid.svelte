<script lang="ts">
	import { run } from 'svelte/legacy';

	import { createEventDispatcher, onMount } from 'svelte';

	import {
		AllCommunityModule,
		ModuleRegistry,
		createGrid,
		themeAlpine,
		colorSchemeDarkBlue
	} from 'ag-grid-community';
	import type { GridOptions, GridApi, CellValueChangedEvent } from 'ag-grid-community';

	ModuleRegistry.registerModules([AllCommunityModule]);

	const dispatch = createEventDispatcher();

	interface Props {
		gridOptions: GridOptions;
		className?: string;
		style?: string;
		isDarkMode?: boolean;
	}

	let { gridOptions, className = '', style = '', isDarkMode = false }: Props = $props();

	let gridApi: GridApi = $state();
	let gridElement: HTMLElement = $state();

	run(() => {
		if (gridApi) {
			gridApi.setGridOption(
				'theme',
				isDarkMode ? themeAlpine.withPart(colorSchemeDarkBlue) : themeAlpine
			);
		}
	});

	const defaultOptions: Partial<GridOptions> = {
		theme: isDarkMode ? themeAlpine.withPart(colorSchemeDarkBlue) : themeAlpine,
		defaultColDef: {
			cellStyle: {
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center'
			},
			sortable: true,
			resizable: true,
			filter: true,
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

<div bind:this={gridElement} class={className} {style}></div>

<style>
	div {
		width: 100%;
	}
</style>
