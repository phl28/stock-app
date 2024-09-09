<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let type = 'error';

	setTimeout(() => dispatch('dismiss'), 3000);
</script>

<div class="toast" transition:fade>
	<div
		class="alert"
		class:alert-info={type === 'info'}
		class:alert-success={type === 'success'}
		class:alert-error={type === 'error'}
		class:alert-warning={type === 'warning'}
	>
		<slot />
	</div>
</div>
