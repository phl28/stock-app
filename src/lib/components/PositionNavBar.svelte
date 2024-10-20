<script lang="ts">
	import { enhance } from '$app/forms';
	import { replacer } from '$lib/helpers/JsonHelpers';
	import { dispatchToast } from '@/routes/stores';

	export let editedPositions: { [key: number]: string } = {};
	export let hasEditedNotes: boolean;
</script>

<div class="m-2 flex flex-row items-center justify-between">
	<h5>Positions</h5>
	<div class="flex justify-end space-x-2">
		{#if hasEditedNotes}
			<form
				action="?/updatePositionBatch"
				method="POST"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							editedPositions = {};
							dispatchToast({ type: 'success', message: 'Position updated successfully!' });
							await update();
						} else if (result.type === 'error') {
							dispatchToast({ type: 'error', message: result.error.message });
						}
					};
				}}
			>
				<input type="hidden" name="positions" value={JSON.stringify(editedPositions, replacer)} />
				<button class="btn btn-primary" type="submit">Save</button>
			</form>
		{/if}
	</div>
</div>
