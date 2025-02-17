<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { darkTheme } from './stores';
	import logo from '$lib/images/logo-no-background.png';
	import { Home, Calculator, LineChart, FileText, Sun, Moon, Menu, X } from 'lucide-svelte';
	import UserButton from 'clerk-sveltekit/client/UserButton.svelte';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import SignedOut from 'clerk-sveltekit/client/SignedOut.svelte';
	import SignInButton from 'clerk-sveltekit/client/SignInButton.svelte';
	import { dark } from '@clerk/themes';

	const navItems = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/calculator', label: 'Calculator', icon: Calculator },
		{ href: '/trade/1', label: 'Trade', icon: LineChart },
		{ href: '/articles/page/1', label: 'Articles', icon: FileText }
	];

	let isSidebarOpen = false;
	const toggleSidebar = () => (isSidebarOpen = !isSidebarOpen);
	const closeSidebar = () => (isSidebarOpen = false);
</script>

<!-- Mobile Navigation Header -->
<header
	class="fixed top-0 z-50 flex h-16 w-full items-center border-b border-base-200 bg-base-100/80 px-4 backdrop-blur-md lg:hidden"
>
	<button class="btn btn-ghost btn-sm" on:click={toggleSidebar}>
		{#if isSidebarOpen}
			<X class="h-5 w-5" />
		{:else}
			<Menu class="h-5 w-5" />
		{/if}
	</button>
	<div class="flex-1" />
	<div class="flex items-center gap-2">
		<button class="btn btn-ghost btn-sm" on:click={() => darkTheme.toggle()}>
			{#if $darkTheme}
				<Sun class="h-4 w-4" />
			{:else}
				<Moon class="h-4 w-4" />
			{/if}
		</button>
		<SignedIn>
			<UserButton
				appearance={{
					baseTheme: $darkTheme ? dark : undefined,
					elements: {
						avatarBox:
							'rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200'
					}
				}}
				afterSignOutUrl="/"
			/>
		</SignedIn>
		<SignedOut>
			<SignInButton>
				<button class="btn btn-primary btn-sm">Sign in</button>
			</SignInButton>
		</SignedOut>
	</div>
</header>

<!-- Sidebar -->
<aside
	class="fixed left-0 top-0 z-40 h-full w-64 transform border-r border-base-200 bg-base-100 transition-transform duration-200 ease-in-out lg:translate-x-0"
	class:translate-x-0={isSidebarOpen}
	class:-translate-x-full={!isSidebarOpen}
>
	<div class="flex h-full flex-col">
		<!-- Logo -->
		<div class="flex h-16 items-center px-4">
			<a href="/" class="flex items-center gap-2" on:click={closeSidebar}>
				<img src={logo} alt="TradeUp" class="h-8 w-auto" />
			</a>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-1 px-2 py-4">
			{#each navItems as { href, label, icon: Icon }}
				<a
					{href}
					class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-base-200"
					class:bg-primary={$page.url.pathname === href}
					class:text-primary={$page.url.pathname === href}
					on:click={closeSidebar}
				>
					<Icon class="h-5 w-5" />
					{label}
				</a>
			{/each}
		</nav>

		<!-- Bottom Section -->
		<div class="hidden border-t border-base-200 p-4 lg:block">
			<div class="flex items-center justify-between">
				<button class="btn btn-ghost btn-sm" on:click={() => darkTheme.toggle()}>
					{#if $darkTheme}
						<Sun class="h-4 w-4" />
					{:else}
						<Moon class="h-4 w-4" />
					{/if}
				</button>
				<SignedIn>
					<UserButton
						appearance={{
							baseTheme: $darkTheme ? dark : undefined,
							elements: {
								avatarBox:
									'rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200'
							}
						}}
						afterSignOutUrl="/"
					/>
				</SignedIn>
				<SignedOut>
					<SignInButton>
						<button class="btn btn-primary btn-sm">Sign in</button>
					</SignInButton>
				</SignedOut>
			</div>
		</div>
	</div>
</aside>

<!-- Overlay -->
{#if isSidebarOpen}
	<div
		class="fixed inset-0 z-30 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity lg:hidden"
		on:click={closeSidebar}
		role="button"
		tabindex="-1"
		aria-label="Close sidebar"
	/>
{/if}

<!-- Main Content -->
<main class="min-h-screen bg-base-100 lg:ml-64">
	<div class="container mx-auto px-4 pt-20 lg:pt-8">
		<slot />
	</div>
</main>
