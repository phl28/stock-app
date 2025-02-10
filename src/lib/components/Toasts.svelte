<script lang="ts">
	import { dismissToast, toasts } from '@/routes/stores.ts';

	import Toast from './Toast.svelte';
</script>

{#if $toasts}
	<section>
		{#each $toasts as toast (toast.id)}
			<Toast type={toast.type} on:dismiss={() => dismissToast(toast.id)}>{toast.message}</Toast>
		{/each}
	</section>
{/if}

<style lang="postcss">
	section {
		position: fixed;
		bottom: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		z-index: 1000;
	}
</style>
