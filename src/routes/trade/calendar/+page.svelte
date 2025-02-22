<script>
	import Calendar from '@event-calendar/core';
	import DayGrid from '@event-calendar/day-grid';

	let { data } = $props();

	const handleDateSet = async (info) => {
		const params = new URLSearchParams();
		params.append('startDate', info.start);
		params.append('endDate', info.end);
		const response = await fetch(`/trade/calendar?${params}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		options.events = data.trades.map((trade) => {
			return {
				id: trade.id,
				start: trade.executedAt,
				end: trade.executedAt,
				title: trade.ticker,
				color: trade.tradeSide === 'BUY' ? '#008000' : '#FF0000',
				backgroundColor: trade.tradeSide === 'BUY' ? '#008000' : '#FF0000',
				borderColor: trade.tradeSide === 'BUY' ? '#008000' : '#FF0000',
				textColor: trade.tradeSide === 'BUY' ? '#FFFFFF' : '#FFFFFF',
				editable: false,
				display: 'auto'
			};
		});
	};

	let plugins = [DayGrid];
	let options = $state({
		view: 'dayGridMonth',
		events: data.trades.map((trade) => {
			return {
				id: trade.id,
				start: trade.executedAt,
				end: trade.executedAt,
				title: trade.ticker,
				color: trade.tradeSide === 'BUY' ? '#008000' : '#FF0000',
				backgroundColor: trade.tradeSide === 'BUY' ? '#008000' : '#FF0000',
				borderColor: trade.tradeSide === 'BUY' ? '#008000' : '#FF0000',
				textColor: trade.tradeSide === 'BUY' ? '#FFFFFF' : '#FFFFFF',
				editable: false,
				display: 'auto'
			};
		}),
		datesSet: handleDateSet,
		buttonText: {
			today: 'Today'
		}
	});
</script>

<Calendar {plugins} {options} />
