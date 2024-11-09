<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import githubLight from '$lib/images/github-mark.svg';
	import githubDark from '$lib/images/github-mark-white.svg';
	import { theme } from './stores.ts';
	import Toasts from '$lib/components/Toasts.svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	injectSpeedInsights();
	inject({ mode: dev ? 'development' : 'production' });
</script>

<div data-theme={$theme ? 'dark' : 'light'} class="app">
	<Toasts />
	<Header>
		<main>
			<slot />
		</main>
	</Header>

	<footer>
		Check out the GitHub repository!
		<a class="m-3" href="https://github.com/phl28/stock-app">
			{#if $theme}
				<img src={githubDark} alt="GitHub" />
			{:else}
				<img src={githubLight} alt="GitHub" />
			{/if}
		</a>
	</footer>
</div>

<!-- style need to use lang="postcss" if using tailwind css in the style block-->
<style lang="postcss">
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		max-width: 100%;
		width: 100%;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 100%;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 2rem;
	}

	footer img {
		height: 3rem;
		width: 3rem;
	}
</style>
