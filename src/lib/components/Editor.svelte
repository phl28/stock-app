<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let data = {};
	export let readOnly = false;
	export let placeholder = 'What are your thoughts for this week?';
	export let autofocus = true;

	let editor;

	onMount(async () => {
		if (browser) {
			const EditorJS = (await import('@editorjs/editorjs')).default;
			const Header = (await import('@editorjs/header')).default;
			const List = (await import('@editorjs/list')).default;
			const Paragraph = (await import('@editorjs/paragraph')).default;
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
					header: Header,
					list: {
						class: List,
						inlineToolbar: true
					},
					paragraph: Paragraph,
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
				 * onReady callback
				 */
				onReady: () => {
					console.log('Editor.js is ready to work!');
				},
				/**
				 * onChange callback
				 */
				onChange: (api, event) => {
					console.log("Now I know that Editor's content changed!", event);
				},
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

	export function save() {
		editor
			.save()
			.then((outputData) => {
				console.log('Article data: ', outputData);
			})
			.catch((error) => {
				console.log('Saving failed: ', error);
			});
		// return editor.save();
	}
</script>

<section>
	<div id="article-editor" class="article-editor"></div>
	<button class="btn btn-primary" on:click={save}>Save</button>
</section>
