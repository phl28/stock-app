<script lang="ts">
	import SignIn from 'clerk-sveltekit/client/SignIn.svelte';
	import { dark } from '@clerk/themes';
	import { darkTheme } from '@/routes/stores.ts';
	import type { PageData } from './$types';
	import { redirect } from '@sveltejs/kit';

	export let data: PageData;
</script>

<div class="my-auto flex h-[calc(100vh-var(--header-height))] items-center justify-center">
	{#if $darkTheme}
		<SignIn
			redirectUrl={data.redirectUrl ?? '/trade/1'}
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
