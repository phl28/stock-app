<script lang="ts">
	import { page } from '$app/stores';

	import logo from '$lib/images/logo-no-background.png';
	import { darkTheme } from '@/routes/stores.ts';

	import UserButton from 'clerk-sveltekit/client/UserButton.svelte';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import SignedOut from 'clerk-sveltekit/client/SignedOut.svelte';
	import SignInButton from 'clerk-sveltekit/client/SignInButton.svelte';
	import { dark } from '@clerk/themes';
	import { Menu, Sun, Moon } from 'lucide-svelte';

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/calculator', label: 'Calculator' },
		{ href: '/trade/1', label: 'Trade' },
		{ href: '/articles/page/1', label: 'Articles' }
	];

	let isOpen = false;
	const toggleMenu = () => (isOpen = !isOpen);
	const closeMenu = () => (isOpen = false);
</script>

<header class="navbar w-screen">
	<div class="container mx-auto flex items-center justify-between px-4">
		<div class="flex items-center gap-8">
			<a href="/" class="flex items-center gap-2">
				<img src={logo} alt="TradeUp" class="h-16 w-auto" />
			</a>

			<nav class="hidden lg:block">
				<ul class="flex items-center gap-6">
					{#each navItems as { href, label }}
						<li>
							<a
								{href}
								class="text-sm font-medium transition-colors hover:text-primary"
								class:text-primary={$page.url.pathname === href}
							>
								{label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>

		<div class="flex items-center gap-4">
			<button class="btn btn-circle btn-ghost" on:click={() => darkTheme.toggle()}>
				{#if $darkTheme}
					<Sun class="h-5 w-5" />
				{:else}
					<Moon class="h-5 w-5" />
				{/if}
			</button>

			<SignedIn>
				{#if $darkTheme}
					<UserButton
						appearance={{
							baseTheme: dark
						}}
						userProfileProps={{ appearance: { baseTheme: dark } }}
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

			<button class="btn btn-circle btn-ghost lg:hidden" on:click={toggleMenu}>
				<Menu class="h-5 w-5" />
			</button>
		</div>
	</div>
</header>
{#if isOpen}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden"
		on:click={closeMenu}
	/>
	<div
		class="fixed right-0 top-[var(--header-height)] z-50 h-[calc(100vh-var(--header-height))] w-64 transform overflow-y-auto bg-base-100 p-6 shadow-xl transition-transform lg:hidden"
		class:translate-x-0={isOpen}
		class:translate-x-full={!isOpen}
	>
		<nav>
			<ul class="flex flex-col gap-4">
				{#each navItems as { href, label }}
					<li>
						<a
							{href}
							class="block text-sm font-medium transition-colors hover:text-primary"
							class:text-primary={$page.url.pathname === href}
							on:click={closeMenu}
						>
							{label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
{/if}
