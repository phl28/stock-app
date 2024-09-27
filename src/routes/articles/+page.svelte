<script lang="ts">
	import type { PageData } from './$types.js';

	let data: PageData = {
		articles: [
			{
				articleId: 1,
				title: 'Article 1',
				content: 'testing',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				articleId: 2,
				title: 'Article 2',
				content: 'testing',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				articleId: 3,
				title: 'Article 3',
				content: 'testing',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				articleId: 4,
				title: 'Article 4',
				content: 'testing',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				articleId: 5,
				title: 'Article 5',
				content: 'testing',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				articleId: 6,
				title: 'Article 6',
				content: 'testing',
				createdAt: new Date(),
				updatedAt: new Date()
			}
		],
		currentPage: 1,
		totalPages: 4,
		totalArticles: 6
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
</script>

<section class="container mx-auto flex flex-grow flex-col">
	<div class="flex-grow">
		{#if data.articles}
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each data.articles as article (article.articleId)}
					<div class="card card-normal bg-base-100 shadow-xl">
						<div class="card-body">
							<h2 class="card-title justify-start">
								{article.title}<span class="text-xs"
									>Last Updated: {article.createdAt.toLocaleDateString()}</span
								>
							</h2>

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
