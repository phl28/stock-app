<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.article}
	<section class="container flex flex-grow flex-col gap-4">
		<span class="flex justify-center text-3xl font-bold">{data.article.title}</span>
		<Editor readOnly={true} data={data.article.content ?? {}} autofocus={false} />
	</section>
{/if}
