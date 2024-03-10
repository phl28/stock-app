<script>
	import Counter from './Counter.svelte';
</script>

<svelte:head>
	<title>Trade up - #1 Trading Helper</title>
	<meta name="description" content="Trade Your Equity Curve" />
</svelte:head>

<section>
	<Counter />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
