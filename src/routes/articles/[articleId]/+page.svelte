<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.article}
	<Editor readOnly={true} data={data.article} />
{/if}
