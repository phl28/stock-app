<script lang="ts">
	import SignIn from 'clerk-sveltekit/client/SignIn.svelte';
	import { dark, shadesOfPurple, neobrutalism } from '@clerk/themes';
	import { theme } from '../stores.js';
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
