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
			<a href="/" class="flex items-center gap-2 transition-transform hover:scale-105">
				<img src={logo} alt="TradeUp" class="h-12 w-auto" />
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
			<button
				class="btn btn-circle btn-ghost btn-sm"
				on:click={() => darkTheme.toggle()}
				aria-label="Toggle theme"
			>
				{#if $darkTheme}
					<Sun class="h-4 w-4" />
				{:else}
					<Moon class="h-4 w-4" />
				{/if}
			</button>

			<SignedIn>
				{#if $darkTheme}
					<UserButton
						appearance={{
							baseTheme: dark,
							elements: {
								avatarBox:
									'rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200'
							}
						}}
						userProfileProps={{ appearance: { baseTheme: dark } }}
						afterSignOutUrl="/"
					/>
				{:else}
					<UserButton
						appearance={{
							elements: {
								avatarBox:
									'rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200'
							}
						}}
						afterSignOutUrl="/"
					/>
				{/if}
			</SignedIn>

			<SignedOut>
				<SignInButton>
					<button class="btn btn-primary btn-sm gap-2">
						Sign in
						<i class="fas fa-arrow-right text-xs"></i>
					</button>
				</SignInButton>
			</SignedOut>

			<button
				class="btn btn-circle btn-ghost btn-sm lg:hidden"
				on:click={toggleMenu}
				aria-label="Toggle menu"
			>
				<Menu class="h-4 w-4" />
			</button>
		</div>
	</div>
</header>
{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity lg:hidden"
		on:click={closeMenu}
		role="button"
		tabindex="-1"
		aria-label="Close menu"
	/>
	<div
		class="fixed right-0 top-[var(--header-height)] z-50 h-[calc(100vh-var(--header-height))] w-64 transform overflow-y-auto bg-base-100 p-6 shadow-xl transition-transform duration-200 ease-in-out lg:hidden"
		class:translate-x-0={isOpen}
		class:translate-x-full={!isOpen}
	>
		<nav>
			<ul class="flex flex-col gap-4">
				{#each navItems as { href, label }}
					<li>
						<a
							{href}
							class="flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-base-200 hover:text-primary"
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
