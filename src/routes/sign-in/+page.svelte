<script lang="ts">
	import SignIn from 'clerk-sveltekit/client/SignIn.svelte';
	import { dark } from '@clerk/themes';
	import { theme } from '../stores.ts';
</script>

<div class="flex flex-col items-center justify-center">
	{#if $theme}
		<SignIn
			redirectUrl="/trade/"
			appearance={{
				baseTheme: dark,
				elements: {
					footerAction: { display: 'none' }
				}
			}}
		/>
	{:else}
		<SignIn redirectUrl="/trade/" />
	{/if}
</div>
