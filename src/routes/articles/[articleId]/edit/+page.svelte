<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import { dispatchToast } from '@/routes/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	let title: string = data.article.title;
	let publish: boolean = false;

	const handleSaveArticle = async (outputData: any) => {
		try {
			const response = await fetch(`/articles/${data.article.articleId}/edit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title,
					content: outputData,
					publish
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
	<section class="container flex w-full flex-grow flex-col gap-4" id="test">
		<label class="input input-bordered flex items-center justify-center gap-2">
			Title
			<input type="text" class="grow" placeholder="Title here" bind:value={title} />
		</label>
		<Editor readOnly={false} data={data.article.content ?? {}} onSave={handleSaveArticle}>
			<div class="form-control">
				<label class="label flex cursor-pointer gap-3">
					<span class="label-text">Publish</span>
					<input
						type="checkbox"
						class="toggle"
						checked={publish}
						on:change={() => (publish = !publish)}
					/>
				</label>
			</div>
		</Editor>
	</section>
{/if}
