<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
	import type { PageData } from './$types';
	import { dispatchToast } from '../../stores';
	import { Trash2, Pencil } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	export let data: PageData;

	const handleDeleteArticle = async () => {
		if (confirm('Are you sure you want to delete this article?')) {
			const response = await fetch(`/articles/delete/${data.article.articleId}`, {
				method: 'DELETE',
				body: JSON.stringify(data.article.content)
			});
			if (!response.ok) {
				throw new Error('Failed to delete article');
			}
			goto('/articles');
			dispatchToast({ type: 'success', message: 'Article deleted successfully!' });
		}
	};
</script>

{#if data.article}
	<section class="container flex flex-grow flex-col gap-4">
		<SignedIn>
			<div class="flex justify-end gap-2">
				<a class="btn btn-circle btn-ghost" href={`/articles/edit/${data.article.articleId}`}
					><Pencil /></a
				>
				<button class="btn btn-circle btn-error" on:click={handleDeleteArticle}><Trash2 /></button>
			</div>
		</SignedIn>
		<span class="flex justify-center text-3xl font-bold">{data.article.title}</span>
		<Editor readOnly={true} data={data.article.content ?? {}} autofocus={false} />
	</section>
{/if}
