<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Trade up - Article {$page.params.articleId}</title>
	<meta
		name="description"
		content="Trade up - Articles - A place where personal ideas and thoughts are shared."
	/>
</svelte:head>

<main class="container">
	<slot />
</main>
<footer class="flex justify-center">
	<a href="https://www.buymeacoffee.com/alui" target="_blank"
		><img
			src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png"
			alt="Buy Me A Coffee"
			style="height: 60px !important;width: 217px !important;"
		/></a
	>
</footer>
