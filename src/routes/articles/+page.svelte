<script lang="ts">
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import type { PageData } from './$types.js';
	import { Search } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';

	export let data: PageData;

	type ArticleData = {
		createdAt: Date;
		updatedAt: Date | null;
		title: string;
		content: unknown;
		articleId: number;
	};

	const handlePageIncrement = () => {
		if (data.currentPage < data.totalPages) {
			data.currentPage += 1;
		}
	};

	const handlePageDecrement = () => {
		if (data.currentPage > 1) {
			data.currentPage -= 1;
		}
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
</script>

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
									href={`articles/${article.articleId}`}
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
							<h2 class="card-title">
								{article.title}
							</h2>
							<span class="text-xs">Uploaded on: {article.createdAt.toLocaleDateString()}</span>

							<div class="card-actions">
								<a
									href={`articles/${article.articleId}`}
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
	{#if data.totalPages > 1}
		<div class="join mt-auto justify-center">
			<button class="btn join-item" on:click={handlePageDecrement}>«</button>
			<button class="btn join-item">{data.currentPage}</button>
			<button class="btn join-item" on:click={handlePageIncrement}>»</button>
		</div>
	{/if}
</section>
