<script lang="ts">
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import type { PageData } from './$types.js';
	import { Search } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { generatePageNumbers } from '$lib/helpers/PageHelpers';

	export let data: PageData;

	type ArticleData = {
		createdAt: Date;
		updatedAt: Date | null;
		publishedAt: Date | null;
		title: string;
		content: unknown;
		articleId: number;
	};

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

	let searchTerm: string = '';
	let searchResults: ArticleData[] = [];

	const handleSearchResults = (result: ActionResult) => {
		if (result.type === 'success') {
			searchResults = result.data?.articles ?? [];
		} else {
			searchResults = [];
		}
	};

	$: pageNumbers = generatePageNumbers(data.currentPage, data.totalPages);
</script>

<svelte:head>
	<title>Trade up - Articles</title>
	<meta
		name="description"
		content="Trade up - Articles - A place where personal ideas and thoughts are shared."
	/>
</svelte:head>

<section class="container mx-auto flex flex-grow flex-col">
	<SignedIn>
		<div class="flex justify-end">
			<form method="POST" action="?/createArticle">
				<button type="submit" class="btn btn-circle">+</button>
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
	>
		<div class="flex justify-center">
			<div class="dropdown my-4 w-1/2">
				<label class="input input-bordered flex w-full items-center gap-2">
					<input
						type="text"
						class="grow"
						name="searchTerm"
						placeholder="Search for articles"
						bind:value={searchTerm}
					/>
					<button type="submit" tabindex="0"><Search /></button>
				</label>
				{#if searchResults.length > 0}
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<ul
						tabindex="0"
						class="menu dropdown-content z-[1] w-full rounded-box bg-base-100 p-2 shadow"
					>
						{#each searchResults as article}
							<li>
								<a
									href={`/articles/${article.articleId}`}
									class="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm leading-5 text-base-content"
								>
									{article.title}
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</form>
	<div class="flex-grow">
		{#if data.articles}
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each data.articles as article (article.articleId)}
					<div class="card bordered card-normal bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title justify-between">
								{article.title}
								<SignedIn
									><div
										class={`badge badge-sm ${article.publishedAt ? 'badge-primary' : 'badge-neutral'}`}
									>
										{article.publishedAt ? 'Published' : 'Draft'}
									</div></SignedIn
								>
							</h2>
							<span class="text-xs"
								>Uploaded on: {article.publishedAt?.toLocaleDateString() ??
									article.createdAt.toLocaleDateString()}</span
							>

							<div class="card-actions">
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
		{/if}
	</div>
	<div class="join mt-6 justify-center">
		<button
			class={`btn join-item ${data.currentPage === 1 ? 'btn-disabled' : ''}`}
			on:click={handlePageDecrement}>«</button
		>
		{#each pageNumbers as pageNum}
			{#if typeof pageNum === 'number'}
				<button
					class={`btn join-item ${pageNum === data.currentPage ? 'btn-active' : ''}`}
					on:click={() => handlePageRedirect(pageNum)}
				>
					{pageNum}
				</button>
			{:else}
				<button class="btn btn-disabled join-item">...</button>
			{/if}
		{/each}
		<button
			class={`btn join-item ${data.currentPage === data.totalPages ? 'btn-disabled' : ''}`}
			on:click={handlePageIncrement}>»</button
		>
	</div>
</section>
