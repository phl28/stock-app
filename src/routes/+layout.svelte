<script lang="ts">
	import { dev } from '$app/environment';
	import '../app.css';

	import Header from '$lib/components/Header.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import { darkTheme } from './stores.ts';

	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	injectSpeedInsights();
	inject({ mode: dev ? 'development' : 'production' });

	const currentYear = new Date().getFullYear();
</script>

<div data-theme={$darkTheme ? 'dark' : 'light'} class="min-h-screen">
	<Toasts />
	<Header />
	<main class="container mx-auto">
		<slot />
	</main>

	<footer class="footer footer-center bg-base-200 p-8 text-base-content">
		<div class="flex flex-col items-center gap-4">
			<p class="text-sm opacity-75">© {currentYear} Trade Up. All rights reserved.</p>
		</div>
	</footer>
</div>
