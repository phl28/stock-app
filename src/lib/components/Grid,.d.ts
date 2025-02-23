import type { SvelteComponentTyped } from 'svelte';
import type { GridProps } from './Grid.svelte';

export default class Grid<TData> extends SvelteComponentTyped<GridProps<TData>> {}