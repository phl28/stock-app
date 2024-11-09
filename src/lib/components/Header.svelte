<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/logo-no-background.png';
	import { theme } from '@/routes/stores.ts';
	import UserButton from 'clerk-sveltekit/client/UserButton.svelte';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import SignedOut from 'clerk-sveltekit/client/SignedOut.svelte';
	import SignInButton from 'clerk-sveltekit/client/SignInButton.svelte';
	import { dark } from '@clerk/themes';
	import { AlignJustify, Sun, Moon } from 'lucide-svelte';

	const toggle = () => {
		theme.toggle();
		document.getElementById('toggle')?.classList.toggle('fa-moon');
		document.getElementById('toggle')?.classList.toggle('fa-sun');
	};

	const closeDrawer = () => {
		const drawerToggle = document.getElementById('my-drawer-3');
		if (drawerToggle instanceof HTMLInputElement) {
			drawerToggle.checked = false;
		}
	};

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/', label: 'Stock calculator' },
		{ href: '/trade/1', label: 'Trade' },
		{ href: '/articles/page/1', label: 'Articles' }
	];
</script>

<div class="drawer">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<div class="navbar mb-4 flex w-full flex-row items-center justify-between">
			<div>
				<div class="flex-none lg:hidden">
					<label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
						<AlignJustify />
					</label>
				</div>
				<div class="corner">
					<a href="/">
						<img src={logo} alt="TradeUp" />
					</a>
				</div>
			</div>
			<nav class="hidden flex-none lg:flex">
				<ul id="nav-list-normal">
					{#each navItems as item}
						<li><a href={item.href}>{item.label}</a></li>
					{/each}
				</ul>
			</nav>
			<div class="flex items-center justify-end pe-3">
				<label class="mx-2 flex cursor-pointer gap-2">
					<Sun />
					<input type="checkbox" on:click={toggle} class="theme-controller toggle" />
					<Moon />
				</label>
				<SignedIn>
					{#if $theme}
						<UserButton
							appearance={{
								baseTheme: dark,
								userProfile: { baseTheme: dark }
							}}
							afterSignOutUrl="/"
						/>
					{:else}
						<UserButton afterSignOutUrl="/" />
					{/if}
				</SignedIn>
				<SignedOut>
					<SignInButton>
						<button class="btn btn-primary btn-sm">Sign in</button>
					</SignInButton>
				</SignedOut>
			</div>
		</div>
		<slot />
	</div>
	<div class="drawer-side z-10">
		<label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu min-h-full w-60 bg-base-200">
			<li class="w-1/2">
				<a href="/" class="p-0" on:click={closeDrawer}>
					<img src={logo} alt="TradeUp" />
				</a>
			</li>
			{#each navItems as item}
				<li class="w-full font-semibold">
					<a href={item.href} on:click={closeDrawer}>{item.label}</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
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

	#nav-list-normal {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background-size: contain;
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
	}

	li {
		position: relative;
		height: 100%;
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
