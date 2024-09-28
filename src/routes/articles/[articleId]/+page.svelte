<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.article}
	<section class="container flex flex-grow flex-col gap-4">
		<Editor readOnly={true} data={data.article.content ?? {}} />
	</section>
{/if}
