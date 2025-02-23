<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	import { compressImage } from '$lib/helpers/ImageCompressor';

	export let data = {};
	export let readOnly = false;
	export let placeholder = 'What are your thoughts for this week?';
	export let autofocus = true;
	export let onSave = undefined;
	export let removeImages = undefined;
	export let autoSave = false;

	let saveTimeout;

	let editor;
	const removedImagesUrl = [];

	onMount(async () => {
		if (browser) {
			const EditorJS = (await import('@editorjs/editorjs')).default;
			const Header = (await import('@editorjs/header')).default;
			const List = (await import('@editorjs/list')).default;
			const Quote = (await import('@editorjs/quote')).default;
			const ImageTool = (await import('@editorjs/image')).default;
			const CheckList = (await import('@editorjs/checklist')).default;
			const Table = (await import('@editorjs/table')).default;
			const Embed = (await import('@editorjs/embed')).default;

			class CustomImageTool extends ImageTool {
				removed() {
					const fileUrl = this._data.file.url;
					if (fileUrl.includes('blob.vercel-storage.com')) {
						removedImagesUrl.push(fileUrl);
					}
				}
			}

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
						levels: [1, 2, 3, 4, 5, 6],
						defaultLevel: 2
					},
					list: {
						class: List,
						inlineToolbar: true
					},
					quote: Quote,
					embed: Embed,
					image: {
						class: CustomImageTool,
						config: {
							endpoints: {
								byFile: '/articles/upload-image'
							},
							field: 'image',
							captionPlaceholder: 'Image caption',
							uploader: {
								async uploadByFile(file) {
									const compressedBlob = await compressImage(file);
									const formData = new FormData();
									formData.append('image', compressedBlob, file.name);
									const response = await fetch('/articles/upload-image', {
										method: 'POST',
										body: formData
									});
									return response.json();
								},
								async uploadByUrl(url) {
									const blob = await fetch(url).then((res) => res.blob());
									const compressedBlob = await compressImage(blob);
									const formData = new FormData();
									formData.append('image', compressedBlob, `image-${Date.now()}.jpeg`);
									const response = await fetch('/articles/upload-image', {
										method: 'POST',
										body: formData
									});
									return response.json();
								}
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
				readOnly: false,
				onChange: () => {
					if (autoSave) {
						debouncedSave();
					}
				},
				onReady: async () => {
					await editor.readOnly.toggle(readOnly);
				}
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
				if (removedImagesUrl.length > 0) {
					// remove images from storage
					removeImages(removedImagesUrl);
					removedImagesUrl.length = 0;
				}
			})
			.catch((error) => {
				console.error('Saving failed: ', error);
			});
	};

	const debouncedSave = () => {
		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(() => {
			save();
		}, 1000);
	};
</script>

<div
	id="article-editor"
	class={`article-editor w-full flex-grow p-4 ${!readOnly ? 'border-spacing-5 rounded-md border-2' : ''} `}
></div>
{#if !readOnly && !autoSave}
	<div class="flex items-center justify-end gap-2">
		<slot></slot>
		<button class="btn btn-neutral" on:click={save}>Save</button>
	</div>
{/if}
