<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	import { dispatchToast } from '@/routes/stores';
	import Editor from '$lib/components/Editor.svelte';

	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import { Trash2, Pencil } from 'lucide-svelte';

	export let data: PageData;

	const handleDeleteArticle = async () => {
		if (confirm('Are you sure you want to delete this article?')) {
			const response = await fetch(`/articles/${data.article.articleId}/delete`, {
				method: 'DELETE',
				body: JSON.stringify(data.article.content)
			});
			if (!response.ok) {
				throw new Error('Failed to delete article');
			}
			goto('/articles/page/1');
			dispatchToast({ type: 'success', message: 'Article deleted successfully!' });
		}
	};
</script>

{#if data.article}
	<section class="container flex flex-grow flex-col gap-4">
		{#if data.user === data.article.createdBy}
			<SignedIn>
				<div class="flex justify-end gap-2">
					<a
						class="btn btn-circle btn-ghost"
						href={`/articles/${data.article.articleId}/edit`}
						data-testid="edit-article-button"><Pencil /></a
					>
					<button
						class="btn btn-circle btn-error"
						on:click={handleDeleteArticle}
						data-testid="delete-article-button"><Trash2 /></button
					>
				</div>
			</SignedIn>
		{/if}
		<span class="flex justify-center text-3xl font-bold">{data.article.title}</span>
		<p class="px-4 text-center text-sm text-neutral-500">
			DISCLAIMER: The analysis provided is based on personal opinion and research. Not financial
			advice. See our full <a href="/articles/disclaimer" class="underline decoration-sky-500"
				>disclaimer</a
			> for details
		</p>
		<Editor readOnly={true} data={data.article.content ?? {}} autofocus={false} />
	</section>
{/if}
