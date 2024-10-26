<script lang="ts">
	import { CircleCheck, Info, OctagonX, TriangleAlert } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let type = 'error';

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
		{/if}<slot />
	</div>
</div>
