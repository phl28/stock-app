<script lang="ts">
	import Toast from './Toast.svelte';

	import { dismissToast, toasts } from '../../routes/stores.ts';
</script>

{#if $toasts}
	<section>
		{#each $toasts as toast (toast.id)}
			<Toast type={toast.type} on:dismiss={() => dismissToast(toast.id)}>{toast.message}</Toast>
		{/each}
	</section>
{/if}
