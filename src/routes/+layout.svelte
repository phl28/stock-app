<script>
	import Header from './Header.svelte';
	import './styles.css';
	import github from '$lib/images/github.svg';
	
	export let data;
	$: loggedIn = data;
</script>

<div class="app">
	<Header {loggedIn}/>

	<main>
		<slot />
	</main>

	<footer>
		Check out the GitHub repository!
		<a href="https://github.com/phl28/stock-calculator">
			<img src={github} alt="GitHub" />
		</a>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #121212;
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
		font-family: var(--font-family);
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
