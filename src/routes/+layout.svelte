<script>
	import '../app.css';
	import Header from '../lib/components/Header.svelte';
	import githubLight from '$lib/images/github-mark.svg';
	import githubDark from '$lib/images/github-mark-white.svg';
	import { theme } from './stores.js';
</script>

<div data-theme={$theme ? 'dark' : 'light'} class="app">
	<Header />

	<main>
		<slot />
	</main>

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
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
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

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
