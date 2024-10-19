<script lang="ts">
	import calculator from '../calculator/calculator';
	export let input = {
		risk: 0.0003,
		entry: 100,
		stop: 96,
		target: 120,
		stopLossPerc: 0.004
	};

	interface CalculatorInput {
		risk: number;
		entry: number;
		stop: number;
		target: number;
		stopLossPerc: number;
	}

	interface TableData {
		rr: number;
		reward: number;
		profit: number;
		coverPrice: number;
	}
	$: data = calculateData(input);
	const { calcProfitPerc, calcRewardPerc, calcCoverPrice } = calculator;
	const riskReward = [2.0, 3.0, 4.0, 5.0];
	const calculateData = (input: CalculatorInput): TableData[] => {
		return riskReward.map((item) => {
			const reward = calcRewardPerc(undefined, undefined, item, input.risk / 100);
			const profit = calcProfitPerc(undefined, undefined, input.stopLossPerc, item);
			const coverPrice = calcCoverPrice(input.entry, profit);
			return {
				rr: item,
				reward,
				profit,
				coverPrice
			};
		});
	};
	let customRR: number;
	let customReward: number;
	let customProfit: number;
	let customCoverPrice: number;
	$: {
		customReward = calcRewardPerc(undefined, undefined, customRR, input.risk / 100);
		customProfit = calcProfitPerc(undefined, undefined, input.stopLossPerc, customRR);
		customCoverPrice = calcCoverPrice(input.entry, customProfit);
	}
</script>

<div class="overflow-x-auto">
	<table class="table table-pin-rows table-pin-cols table-sm">
		<thead>
			<tr>
				<th>R / R</th>
				{#each data as row}
					<td>{row.rr}</td>
				{/each}
				<td>
					<label>
						<input
							type="number"
							class="input-xs"
							step="0.5"
							placeholder="Custom (e.g. 5.5)"
							bind:value={customRR}
						/>
					</label>
				</td>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th>Reward</th>
				{#each data as row}
					<td>{(row.reward * 100).toFixed(2)} %</td>
				{/each}
				<td>{(customReward * 100).toFixed(2)} %</td>
			</tr>
			<tr>
				<th>Profit</th>
				{#each data as row}
					<td>{(row.profit * 100).toFixed(2)} %</td>
				{/each}
				<td>{(customProfit * 100).toFixed(2)}</td>
			</tr>
			<tr>
				<th>Cover Price</th>
				{#each data as row}
					<td>{row.coverPrice.toFixed(2)}</td>
				{/each}
				<td>{customCoverPrice.toFixed(2)}</td>
			</tr>
		</tbody>
	</table>
</div>
