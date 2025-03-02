<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';
	import type { PageData } from './$types.js';

	import { generatePageNumbers } from '$lib/helpers/PageHelpers';

	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import { Search } from 'lucide-svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	type ArticleData = {
		createdAt: Date;
		updatedAt: Date | null;
		publishedAt: Date | null;
		title: string;
		content: unknown;
		articleId: number;
		createdBy: string;
	};

	let visibleArticles: ArticleData[] = [];
	$: visibleArticles = data.articles.filter(
		(article) => article.publishedAt !== null || article.createdBy === data.user
	);

	const handlePageIncrement = () => {
		if (data.currentPage < data.totalPages) {
			handlePageRedirect(data.currentPage + 1);
		}
	};

	const handlePageDecrement = () => {
		if (data.currentPage > 1) {
			handlePageRedirect(data.currentPage - 1);
		}
	};

	const handlePageRedirect = (pageNumber: number) => {
		goto(`/articles/page/${pageNumber}`);
	};

	let searchTerm: string = $state('');
	let searchResults: ArticleData[] = $state([]);

	const handleSearchResults = (result: ActionResult) => {
		if (result.type === 'success') {
			searchResults = result.data?.articles ?? [];
		} else {
			searchResults = [];
		}
	};

	let pageNumbers = $derived(generatePageNumbers(data.currentPage, data.totalPages));
</script>

<svelte:head>
	<title>Trading Articles & Insights</title>
	<meta name="description" content="Explore trading insights, analysis, and educational content." />
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8">
	<div class="mb-8">
		<h1 class="text-center">Trading Insights</h1>
		<p class="mt-2 text-center text-base-content/60">
			Explore trading analysis, strategies, and market insights
		</p>
	</div>

	<div class="card bg-base-100 p-6 shadow-lg">
		<SignedIn>
			<div class="mb-6 flex justify-end">
				<form method="POST" action="?/createArticle">
					<button type="submit" class="btn btn-primary">New Article</button>
				</form>
			</div>
		</SignedIn>

		<form
			method="POST"
			action="?/searchArticles"
			use:enhance={() => {
				return async ({ result }) => {
					handleSearchResults(result);
				};
			}}
			class="mb-8 flex w-full"
		>
			<div class="dropdown mx-auto w-full max-w-2xl">
				<label class="input input-bordered flex items-center gap-2">
					<input
						type="text"
						class="grow"
						name="searchTerm"
						placeholder="Search articles..."
						bind:value={searchTerm}
					/>
					<button type="submit" class="btn btn-circle btn-ghost">
						<Search class="h-5 w-5" />
					</button>
				</label>
				{#if searchResults.length > 0}
					<ul class="menu dropdown-content z-[1] mt-2 w-full rounded-box bg-base-100 p-2 shadow-lg">
						{#each searchResults as article}
							<li>
								<a
									href={`/articles/${article.articleId}`}
									class="flex items-center justify-between gap-2 px-4 py-3 hover:bg-base-200"
								>
									<span class="font-medium">{article.title}</span>
									<span class="text-sm opacity-60">
										{new Date(article.createdAt).toLocaleDateString()}
									</span>
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</form>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each visibleArticles as article (article.articleId)}
				<div class="card bg-base-200 transition-all hover:shadow-lg">
					<div class="card-body">
						<div class="flex items-start justify-between gap-4">
							<h2 class="card-title flex-1">{article.title}</h2>
							{#if article.createdBy === data.user}
								<SignedIn>
									<div class={`badge ${article.publishedAt ? 'badge-primary' : 'badge-neutral'}`}>
										{article.publishedAt ? 'Published' : 'Draft'}
									</div>
								</SignedIn>
							{/if}
						</div>
						<p class="text-sm text-base-content/60">
							{article.publishedAt?.toLocaleDateString() ?? article.createdAt.toLocaleDateString()}
						</p>
						<div class="card-actions mt-4">
							<a
								href={`/articles/${article.articleId}`}
								class="btn btn-outline btn-neutral btn-sm w-full"
							>
								Read More
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-8 flex justify-center">
			<div class="join">
				<button
					class={`btn join-item ${data.currentPage === 1 ? 'btn-disabled' : ''}`}
					onclick={handlePageDecrement}>«</button
				>
				{#each pageNumbers as pageNum}
					{#if typeof pageNum === 'number'}
						<button
							class={`btn join-item ${pageNum === data.currentPage ? 'btn-active' : ''}`}
							onclick={() => handlePageRedirect(pageNum)}
						>
							{pageNum}
						</button>
					{:else}
						<button class="btn btn-disabled join-item">...</button>
					{/if}
				{/each}
				<button
					class={`btn join-item ${data.currentPage === data.totalPages ? 'btn-disabled' : ''}`}
					onclick={handlePageIncrement}>»</button
				>
			</div>
		</div>
	</div>
</div>
