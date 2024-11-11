<script lang="ts">
	import SignIn from 'clerk-sveltekit/client/SignIn.svelte';
	import { dark } from '@clerk/themes';
	import { theme } from '@/routes/stores.ts';
</script>

<div class="my-auto flex h-[calc(100vh-var(--header-height))] items-center justify-center">
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
