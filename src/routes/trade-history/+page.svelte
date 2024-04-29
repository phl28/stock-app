<script>
</script>

<svelte:head>
	<title>Trade history</title>
	<meta
		name="description"
		content="Allows users to see their past trades and be able to get insights out of it."
	/>
</svelte:head>

<div class="overflow-x-auto">
	<table class="table table-pin-rows table-pin-cols table-xs">
		<thead>
			<tr>
				<td>Active</td>
				<td>Ticker</td>
				<td>Name</td>
				<td>Region</td>
				<td>Quantity</td>
				<td>Price</td>
				<td>Platform</td>
				<td>Direction</td>
				<td>Executed At</td>
				<td>Notes</td>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>
					<label>
						<input type="checkbox" class="checkbox" />
					</label>
				</td>
				<td>AAPL</td>
				<td>Apple Inc.</td>
				<td>US</td>
				<td>100</td>
				<td>$100</td>
				<td>Futu</td>
				<td>BUY</td>
				<td>2020-01-01</td>
				<td>
					<textarea
						placeholder="Notes"
						class="textarea textarea-bordered textarea-xs w-full max-w-xs"
					></textarea>
				</td>
			</tr>
		</tbody>
	</table>
</div>
