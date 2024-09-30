<script lang="ts">
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import type { PageData } from './$types.js';

	export let data: PageData;

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
</script>

<section class="container mx-auto flex flex-grow flex-col">
	<SignedIn>
		<div class="flex justify-end">
			<form method="POST" action="?/createArticle">
				<button type="submit" class="btn btn-circle">+</button>
			</form>
		</div>
	</SignedIn>
	<div class="flex-grow">
		{#if data.articles}
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each data.articles as article (article.articleId)}
					<div class="card card-normal bg-base-100 shadow-xl">
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
