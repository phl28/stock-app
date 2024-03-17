<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/logo-no-background.png';
	import { theme } from '../../routes/stores.js';

	/**
	 * loggedIn is a boolean that is true if the user is logged in
	 * @type {boolean}
	 */
	export let data;
	$: loggedIn = data;

	const toggle = () => {
		theme.toggle();
		document.getElementById('toggle').classList.toggle('fa-moon');
		document.getElementById('toggle').classList.toggle('fa-sun');
	};
</script>

<header>
	<div class="corner">
		<a href="/">
			<img src={logo} alt="TradeUp" />
		</a>
	</div>
	<nav>
		<ul>
			<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">Home</a>
			</li>
			<li aria-current={$page.url.pathname.startsWith('/calculator') ? 'page' : undefined}>
				<a href="/calculator">Stock calculator</a>
			</li>
			<li aria-current={$page.url.pathname.startsWith('/trade-history') ? 'page' : undefined}>
				<a href="/trade-history">Trade history</a>
			</li>
		</ul>
	</nav>

	<button on:click={toggle}>
		<i class="fas fa-moon" id="toggle"></i>
	</button>
	{#if loggedIn}
		<a href="/login" class="login-link">Log in</a>
	{:else}
		<a href="/logout" class="login-link">Log out</a>
	{/if}
</header>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 10em;
		height: 10em;
		object-fit: contain;
	}

	.login-link {
		margin-right: 1rem; /* Add some spacing on the right */
		padding: 0.5rem 1rem; /* Add some padding for button-like appearance */
		border-radius: 0.25rem; /* Add some border radius for a rounded button */
		text-decoration: none; /* Remove underline */
		font-weight: 700; /* Make the text bold */
	}

	nav {
		display: flex;
		justify-content: center;
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		/* left: calc(50% - var(--size)); */
		/* border: var(--size) solid transparent; */
		/* border-top: var(--size) solid var(--color-theme-1); */
	}

	nav a {
		/* font-family: var(--font-family); */
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		/* transition: color 0.2s linear; */
	}
</style>
