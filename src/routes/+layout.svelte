<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import { theme } from './stores.ts';
	import Toasts from '$lib/components/Toasts.svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	injectSpeedInsights();
	inject({ mode: dev ? 'development' : 'production' });

	const currentYear = new Date().getFullYear();
</script>

<div data-theme={$theme ? 'dark' : 'light'} class="min-h-screen">
	<Toasts />
	<Header />
	<main class="container mx-auto">
		<slot />
	</main>

	<footer class="footer footer-center bg-base-200 p-8 text-base-content">
		<div class="flex flex-col items-center gap-4">
			<p class="text-sm opacity-75">© {currentYear} Trade Up. All rights reserved.</p>
			<a
				href="https://github.com/phl28/stock-app"
				class="btn btn-ghost btn-sm gap-2"
				target="_blank"
				rel="noopener noreferrer"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-github"
					><path
						d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
					/><path d="M9 18c-4.51 2-5-2-7-2" /></svg
				>
				View on GitHub
			</a>
		</div>
	</footer>
</div>
