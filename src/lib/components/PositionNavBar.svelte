<script lang="ts">
	import { enhance } from '$app/forms';
	import { replacer } from '$lib/helpers/JsonHelpers';
	import { dispatchToast } from '@/routes/stores';

	export let numOfPositions: number = 0;
</script>

<div class="m-2 flex flex-row items-center justify-between">
	<h5>Positions ({numOfPositions})</h5>
</div>
