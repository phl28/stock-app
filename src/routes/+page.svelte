<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Trade Up - Smart Trading Platform</title>
	<meta
		name="description"
		content="Elevate your trading with advanced tools for position sizing, risk management, and market analysis."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-16">
	<div class="grid gap-16 lg:grid-cols-2 lg:gap-8">
		<div class="flex flex-col justify-center">
			<h1 class="mb-6 text-5xl font-bold tracking-tight lg:text-6xl">
				Smart Trading
				<span class="text-primary">Made Simple</span>
			</h1>
			<p class="mb-8 text-lg text-base-content/70">
				Take control of your trading journey with our comprehensive platform. Calculate optimal
				position sizes, track your trades, and make data-driven decisions.
			</p>
			<div class="flex flex-wrap gap-4">
				<a href="/trade/1" class="btn btn-primary gap-2">
					Start Trading
					<ArrowRight class="h-4 w-4" />
				</a>
				<a href="/articles/page/1" class="btn btn-outline">Learn More</a>
			</div>
		</div>

		<div class="grid gap-8 sm:grid-cols-2">
			<div class="card bg-base-200 transition-all hover:shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Position Calculator</h3>
					<p class="text-base-content/70">
						Calculate optimal position sizes and manage risk effectively.
					</p>
				</div>
			</div>

			<div class="card bg-base-200 transition-all hover:shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Trade Tracking</h3>
					<p class="text-base-content/70">
						Monitor your trades and analyze your performance over time.
					</p>
				</div>
			</div>

			<div class="card bg-base-200 transition-all hover:shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Market Analysis</h3>
					<p class="text-base-content/70">
						Access real-time market data and technical analysis tools.
					</p>
				</div>
			</div>

			<div class="card bg-base-200 transition-all hover:shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Trading Insights</h3>
					<p class="text-base-content/70">Learn from expert analysis and educational content.</p>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-24">
		<h2 class="mb-12 text-center text-3xl font-bold">Why Choose Trade Up?</h2>
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Smart Risk Management</h3>
					<p>Calculate position sizes and stop losses based on your risk tolerance.</p>
				</div>
			</div>

			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Performance Tracking</h3>
					<p>Monitor your trading performance with detailed analytics and insights.</p>
				</div>
			</div>

			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title">Educational Resources</h3>
					<p>Access trading articles and insights to improve your strategy.</p>
				</div>
			</div>
		</div>
	</div>
</div>
