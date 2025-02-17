<script lang="ts">
	import { ArrowRight, ChartLine, Shield, Brain, TrendingUp, Menu, X } from 'lucide-svelte';
	import { writable } from 'svelte/store';

	// Sidebar toggle state
	const isSidebarOpen = writable(false);
</script>

<svelte:head>
	<title>Trade Up - Smart Trading Platform</title>
	<meta
		name="description"
		content="Elevate your trading with advanced tools for position sizing, risk management, and market analysis."
	/>
</svelte:head>

<div class="flex min-h-screen bg-gray-50">
	<!-- Sidebar -->
	<aside
		class="fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out
		{$isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
		lg:relative lg:translate-x-0"
	>
		<div class="flex h-full flex-col">
			<div class="flex items-center justify-between border-b p-4">
				<h2 class="text-2xl font-bold text-gray-800">Trade Up</h2>
				<button
					class="lg:hidden"
					on:click={() => isSidebarOpen.set(false)}
					aria-label="Close sidebar"
				>
					<X class="h-6 w-6 text-gray-600" />
				</button>
			</div>

			<nav class="flex-1 space-y-2 overflow-y-auto p-4">
				<a href="/trade/1" class="sidebar-link">
					<ChartLine class="mr-3 h-5 w-5" />
					Trade
				</a>
				<a href="/articles/page/1" class="sidebar-link">
					<Brain class="mr-3 h-5 w-5" />
					Learn
				</a>
				<a href="/risk-management" class="sidebar-link">
					<Shield class="mr-3 h-5 w-5" />
					Risk Management
				</a>
				<a href="/performance" class="sidebar-link">
					<TrendingUp class="mr-3 h-5 w-5" />
					Performance
				</a>
			</nav>

			<div class="border-t p-4">
				<button
					class="btn w-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
					on:click={() => (window.location.href = '/trade/1')}
				>
					Start Trading
					<ArrowRight class="ml-2 h-4 w-4" />
				</button>
			</div>
		</div>
	</aside>

	<!-- Mobile Menu Trigger (Floating Button) -->
	<button
		class="fixed bottom-4 right-4 z-40 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700 lg:hidden"
		on:click={() => isSidebarOpen.set(true)}
		aria-label="Open menu"
	>
		<Menu class="h-6 w-6" />
	</button>

	<!-- Main Content Area -->
	<div class="flex-1 lg:ml-64">
		<!-- Content -->
		<main class="container mx-auto px-4 py-8">
			<div class="grid gap-8 lg:grid-cols-2">
				<div class="flex flex-col justify-center space-y-6">
					<h1 class="text-4xl font-bold leading-tight text-gray-900">
						Smart Trading
						<span class="block text-blue-600">Made Simple</span>
					</h1>
					<p class="max-w-prose text-lg text-gray-600">
						Elevate your trading with our comprehensive platform. Calculate optimal position sizes,
						track your trades, and make data-driven decisions with ease.
					</p>
					<div class="flex space-x-4 lg:hidden">
						<a
							href="/trade/1"
							class="btn bg-blue-600 text-white transition-colors hover:bg-blue-700"
						>
							Start Trading
							<ArrowRight class="ml-2 h-4 w-4" />
						</a>
						<a
							href="/articles/page/1"
							class="btn bg-gray-100 text-gray-800 transition-colors hover:bg-gray-200"
						>
							Learn More
						</a>
					</div>
				</div>

				<div class="grid gap-6 sm:grid-cols-2">
					{#each [{ icon: ChartLine, title: 'Position Calculator', description: 'Smart position sizing and risk management tools.' }, { icon: Shield, title: 'Risk Management', description: 'Advanced tools to protect your investments.' }, { icon: Brain, title: 'Market Insights', description: 'AI-powered market analysis and predictions.' }, { icon: TrendingUp, title: 'Performance Tracking', description: 'Comprehensive trade performance metrics.' }] as feature}
						<div
							class="transform rounded-xl bg-white p-6 shadow-md transition-all hover:scale-105 hover:shadow-lg"
						>
							<svelte:component this={feature.icon} class="mb-4 h-8 w-8 text-blue-600" />
							<h3 class="mb-2 text-lg font-semibold text-gray-800">{feature.title}</h3>
							<p class="text-gray-600">{feature.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</main>
	</div>
</div>

<style>
	.sidebar-link {
		@apply flex items-center rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100;
	}
</style>
