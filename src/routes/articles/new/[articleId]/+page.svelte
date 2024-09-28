<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import type { PageData } from './$types';

	export let article: PageData['article'];
</script>

<section class="container flex flex-grow flex-col gap-4">
	<Editor readOnly={false} data={article.content ?? {}} />
</section>
