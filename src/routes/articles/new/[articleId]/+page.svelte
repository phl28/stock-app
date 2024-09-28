<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let title: string = data.article.title;

	const handleSaveArticle = (outputData: any) => {
		fetch(`/api/update-article/${data.article.articleId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				title,
				content: outputData
			})
		});
	};
</script>

{#if data}
	<section class="container flex flex-grow flex-col gap-4">
		<label class="input input-bordered flex items-center gap-2">
			Title
			<input type="text" class="grow" placeholder="Title here" bind:value={title} />
		</label>
		<Editor readOnly={false} data={data.article.content ?? {}} onSave={handleSaveArticle} />
	</section>
{/if}
