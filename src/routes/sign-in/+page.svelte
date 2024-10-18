<script lang="ts">
	import SignIn from 'clerk-sveltekit/client/SignIn.svelte';
	import { dark } from '@clerk/themes';
	import { theme } from '@/routes/stores.ts';
</script>

<div class="flex flex-col items-center justify-center">
	{#if $theme}
		<SignIn
			redirectUrl="/trade/1"
			appearance={{
				baseTheme: dark,
				elements: {
					footerAction: { display: 'none' }
				}
			}}
		/>
	{:else}
		<SignIn redirectUrl="/trade/1" />
	{/if}
</div>
