<script lang="ts">
	import { ArrowRight, ChartLine, Shield, Brain, TrendingUp } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Trade Up - Smart Trading Platform</title>
	<meta
		name="description"
		content="Elevate your trading with advanced tools for position sizing, risk management, and market analysis."
	/>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
		<!-- Hero Section -->
		<div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-8 shadow-2xl lg:p-12">
			<div class="relative z-10 grid gap-16 lg:grid-cols-2 lg:gap-8">
				<div class="flex flex-col justify-center text-base-100">
					<h1 class="mb-6 text-5xl font-bold tracking-tight lg:text-6xl">
						Smart Trading
						<span class="block bg-gradient-to-r from-base-100 to-base-200 bg-clip-text text-transparent">
							Made Simple
						</span>
					</h1>
					<p class="mb-8 text-lg opacity-90">
						Take control of your trading journey with our comprehensive platform. Calculate optimal
						position sizes, track your trades, and make data-driven decisions.
					</p>
					<div class="flex flex-wrap gap-4">
						<a
							href="/trade/1"
							class="btn bg-base-100 text-primary hover:bg-base-200 hover:text-primary-focus"
						>
							Start Trading
							<ArrowRight class="ml-2 h-4 w-4" />
						</a>
						<a href="/articles/page/1" class="btn btn-ghost text-base-100 hover:bg-primary-focus"
							>Learn More</a
						>
					</div>
				</div>

				<div class="grid gap-6 sm:grid-cols-2">
					<div
						class="card glass backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
					>
						<div class="card-body">
							<ChartLine class="h-8 w-8 text-base-100" />
							<h3 class="card-title text-base-100">Position Calculator</h3>
							<p class="text-base-100/90">Smart position sizing and risk management tools.</p>
						</div>
					</div>

					<div
						class="card glass backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
					>
						<div class="card-body">
							<TrendingUp class="h-8 w-8 text-base-100" />
							<h3 class="card-title text-base-100">Trade Tracking</h3>
							<p class="text-base-100/90">Monitor and analyze your trading performance.</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Features Section -->
		<div class="mt-24">
			<h2
				class="relative mb-16 text-center text-4xl font-bold after:absolute after:-bottom-4 after:left-1/2 after:h-1 after:w-24 after:-translate-x-1/2 after:rounded-full after:bg-primary"
			>
				Why Choose Trade Up?
			</h2>
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				<div
					class="card bg-base-100 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
				>
					<div class="card-body">
						<Shield class="h-8 w-8 text-primary" />
						<h3 class="card-title">Smart Risk Management</h3>
						<p class="text-base-content/70">
							Calculate position sizes and stop losses based on your risk tolerance.
						</p>
					</div>
				</div>

				<div
					class="card bg-base-100 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
				>
					<div class="card-body">
						<ChartLine class="h-8 w-8 text-primary" />
						<h3 class="card-title">Performance Analytics</h3>
						<p class="text-base-content/70">
							Detailed insights and analytics to improve your trading strategy.
						</p>
					</div>
				</div>

				<div
					class="card bg-base-100 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
				>
					<div class="card-body">
						<Brain class="h-8 w-8 text-primary" />
						<h3 class="card-title">AI-Powered Insights</h3>
						<p class="text-base-content/70">
							Leverage machine learning for smarter trading decisions.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
