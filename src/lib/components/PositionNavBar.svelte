<script lang="ts">
	interface Props {
		numOfPositions?: number;
	}

	let { numOfPositions = 0 }: Props = $props();
</script>

<div class="m-2 flex flex-row items-center justify-between">
	<h5>Positions ({numOfPositions})</h5>
</div>
