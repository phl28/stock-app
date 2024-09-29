<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let data = {};
	export let readOnly = false;
	export let placeholder = 'What are your thoughts for this week?';
	export let autofocus = true;
	export let onSave = (outputData) => {};

	let editor;

	onMount(async () => {
		if (browser) {
			const EditorJS = (await import('@editorjs/editorjs')).default;
			const Header = (await import('@editorjs/header')).default;
			const List = (await import('@editorjs/list')).default;
			const Quote = (await import('@editorjs/quote')).default;
			const Image = (await import('@editorjs/image')).default;
			const CheckList = (await import('@editorjs/checklist')).default;
			const Table = (await import('@editorjs/table')).default;
			const Embed = (await import('@editorjs/embed')).default;

			editor = new EditorJS({
				/**
				 * Id of Element that should contain the Editor
				 */
				holder: 'article-editor',
				/**
				 * Available Tools list.
				 * Pass Tool's class or Settings object for each Tool you want to use.
				 * If you use TypeScript you need to explicitly specify that typeof Tool
				 * implements BlockToolConstructable or InlineToolConstructable.
				 */
				tools: {
					header: {
						class: Header,
						config: {
							placeholder: 'Enter a header',
							levels: [1, 2, 3, 4],
							defaultLevel: 2
						},
						inlineToolbar: true
					},
					list: {
						class: List,
						inlineToolbar: true
					},
					quote: Quote,
					embed: Embed,
					image: {
						class: Image,
						config: {
							endpoints: {
								byFile: '',
								byUrl: ''
							}
						}
					},
					checklist: CheckList,
					table: Table
				},
				/**
				 * Previously saved data that should be rendered
				 */
				data: data,
				/**
				 * Enable autofocus
				 */
				autofocus: autofocus,
				placeholder: placeholder,
				readOnly: readOnly
			});
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	export const save = () => {
		editor
			.save()
			.then((outputData) => {
				onSave(outputData);
			})
			.catch((error) => {
				console.error('Saving failed: ', error);
			});
	};
</script>

<div
	id="article-editor"
	class={`article-editor w-full flex-grow p-4 ${!readOnly ? 'border-spacing-5 rounded-md border-2' : ''} `}
></div>
{#if !readOnly}
	<div class="flex justify-end">
		<button class="btn btn-neutral" on:click={save}>Save</button>
	</div>
{/if}
