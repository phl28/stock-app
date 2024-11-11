<script lang="ts">
	import calculator from '$lib/calculator/calculator';
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
			return { rr: item, reward, profit, coverPrice };
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

<div class="overflow-hidden rounded-lg border bg-base-100">
	<table class="table table-sm w-full">
		<thead>
			<tr>
				<th class="bg-base-200">Risk/Reward</th>
				{#each data as row}
					<th class="text-center">{row.rr}:1</th>
				{/each}
				<th class="text-center">
					<input
						type="number"
						class="input input-xs input-bordered w-20"
						step="0.5"
						placeholder="Custom"
						bind:value={customRR}
					/>:1
				</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th class="bg-base-200">Account Growth</th>
				{#each data as row}
					<td class="text-center">{(row.reward * 100).toFixed(2)}%</td>
				{/each}
				<td class="text-center">{(customReward * 100).toFixed(2)}%</td>
			</tr>
			<tr>
				<th class="bg-base-200">Trade Profit</th>
				{#each data as row}
					<td class="text-center">{(row.profit * 100).toFixed(2)}%</td>
				{/each}
				<td class="text-center">{(customProfit * 100).toFixed(2)}%</td>
			</tr>
			<tr>
				<th class="bg-base-200">Target Price</th>
				{#each data as row}
					<td class="text-center">${row.coverPrice.toFixed(2)}</td>
				{/each}
				<td class="text-center">${customCoverPrice.toFixed(2)}</td>
			</tr>
		</tbody>
	</table>
</div>
