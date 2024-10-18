<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import { dispatchToast } from '@/routes/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	let title: string = data.article.title;

	const handleSaveArticle = async (outputData: any) => {
		try {
			const response = await fetch(`/articles/edit/${data.article.articleId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title,
					content: outputData
				})
			});
			if (!response.ok) {
				throw new Error('Failed to save article');
			}
			dispatchToast({ type: 'success', message: 'Article saved successfully!' });
		} catch (error) {
			console.error('Error saving article:', error);
			dispatchToast({ type: 'error', message: 'Failed to save article' });
		}
	};
</script>

{#if data}
	<section class="container flex flex-grow flex-col gap-4">
		<label class="input input-bordered flex items-center justify-center gap-2">
			Title
			<input type="text" class="grow" placeholder="Title here" bind:value={title} />
		</label>
		<Editor readOnly={false} data={data.article.content ?? {}} onSave={handleSaveArticle} />
	</section>
{/if}
