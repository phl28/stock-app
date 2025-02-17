<script lang="ts">
	import { ArrowRight, Calculator, LineChart, BookOpen, Target } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Trade Up - Smart Trading Platform</title>
	<meta
		name="description"
		content="Elevate your trading with advanced tools for position sizing, risk management, and market analysis."
	/>
</svelte:head>

<div class="relative">
	<div
		class="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-base-200/20"
	></div>
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
		<div class="grid gap-16 lg:grid-cols-2 lg:gap-8">
			<div class="flex flex-col justify-center">
				<div class="mb-6 space-y-2">
					<div
						class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
					>
						<span class="relative flex h-2 w-2">
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
							></span>
							<span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
						</span>
						Now with real-time market data
					</div>
					<h1 class="text-5xl font-bold tracking-tight lg:text-6xl">
						Smart Trading
						<span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
							>Made Simple</span
						>
					</h1>
				</div>
				<p class="mb-8 text-lg text-base-content/70">
					Take control of your trading journey with our comprehensive platform. Calculate optimal
					position sizes, track your trades, and make data-driven decisions.
				</p>
				<div class="flex flex-wrap gap-4">
					<a href="/trade/1" class="btn btn-primary gap-2">
						Start Trading
						<ArrowRight class="h-4 w-4" />
					</a>
					<a href="/articles/page/1" class="btn btn-outline gap-2">
						Learn More
						<BookOpen class="h-4 w-4" />
					</a>
				</div>
			</div>

			<div class="grid gap-6 sm:grid-cols-2">
				<div class="group card bg-base-100 p-6 transition-all hover:-translate-y-1">
					<Calculator class="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
					<h3 class="mt-4 text-xl font-semibold">Position Calculator</h3>
					<p class="mt-2 text-base-content/70">
						Calculate optimal position sizes and manage risk effectively.
					</p>
				</div>

				<div class="group card bg-base-100 p-6 transition-all hover:-translate-y-1">
					<LineChart class="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
					<h3 class="mt-4 text-xl font-semibold">Trade Tracking</h3>
					<p class="mt-2 text-base-content/70">
						Monitor your trades and analyze your performance over time.
					</p>
				</div>

				<div class="group card bg-base-100 p-6 transition-all hover:-translate-y-1">
					<Target class="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
					<h3 class="mt-4 text-xl font-semibold">Market Analysis</h3>
					<p class="mt-2 text-base-content/70">
						Access real-time market data and technical analysis tools.
					</p>
				</div>

				<div class="group card bg-base-100 p-6 transition-all hover:-translate-y-1">
					<BookOpen class="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
					<h3 class="mt-4 text-xl font-semibold">Trading Insights</h3>
					<p class="mt-2 text-base-content/70">
						Learn from expert analysis and educational content.
					</p>
				</div>
			</div>
		</div>

		<div class="mt-32">
			<div class="text-center">
				<h2 class="text-3xl font-bold sm:text-4xl">Why Choose Trade Up?</h2>
				<p class="mt-4 text-lg text-base-content/70">
					Everything you need to succeed in your trading journey.
				</p>
			</div>
			<div class="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				<div class="group card bg-base-100 p-6 shadow-lg transition-all hover:-translate-y-1">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"
					>
						<i class="fas fa-shield-alt text-xl"></i>
					</div>
					<h3 class="mt-4 text-xl font-semibold">Smart Risk Management</h3>
					<p class="mt-2 text-base-content/70">
						Calculate position sizes and stop losses based on your risk tolerance.
					</p>
				</div>

				<div class="group card bg-base-100 p-6 shadow-lg transition-all hover:-translate-y-1">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"
					>
						<i class="fas fa-chart-line text-xl"></i>
					</div>
					<h3 class="mt-4 text-xl font-semibold">Performance Tracking</h3>
					<p class="mt-2 text-base-content/70">
						Monitor your trading performance with detailed analytics and insights.
					</p>
				</div>

				<div class="group card bg-base-100 p-6 shadow-lg transition-all hover:-translate-y-1">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"
					>
						<i class="fas fa-graduation-cap text-xl"></i>
					</div>
					<h3 class="mt-4 text-xl font-semibold">Educational Resources</h3>
					<p class="mt-2 text-base-content/70">
						Access trading articles and insights to improve your strategy.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
