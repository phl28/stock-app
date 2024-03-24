<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/logo-no-background.png';
	import { theme } from '../../routes/stores.js';

	const toggle = () => {
		theme.toggle();
		document.getElementById('toggle')?.classList.toggle('fa-moon');
		document.getElementById('toggle')?.classList.toggle('fa-sun');
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

	<label class="mx-2 flex cursor-pointer gap-2">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><circle cx="12" cy="12" r="5" /><path
				d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
			/></svg
		>
		<input type="checkbox" on:click={toggle} class="theme-controller toggle" />
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg
		>
	</label>
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

	nav {
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
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
