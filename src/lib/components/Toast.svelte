<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	import { CircleCheck, Info, OctagonX, TriangleAlert } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	interface Props {
		type?: string;
		children?: import('svelte').Snippet;
	}

	let { type = 'error', children }: Props = $props();

	setTimeout(() => dispatch('dismiss'), 3000);
</script>

<div class="toast relative p-1" transition:fade>
	<div
		class="alert"
		class:alert-info={type === 'info'}
		class:alert-success={type === 'success'}
		class:alert-error={type === 'error'}
		class:alert-warning={type === 'warning'}
	>
		{#if type === 'success'}
			<CircleCheck />
		{:else if type === 'error'}
			<OctagonX />
		{:else if type === 'warning'}
			<TriangleAlert />
		{:else}
			<Info />
		{/if}{@render children?.()}
	</div>
</div>
