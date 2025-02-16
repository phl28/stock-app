<script>
	import Calendar from '@event-calendar/core';
	import DayGrid from '@event-calendar/day-grid';

	const handleDateSet = async (info) => {
		console.log('Date range changed:', info.start, info.end);
		// Fetch events for the new date range here
		// Example:
		// fetchEvents(info.start, info.end).then(events => {
		//   options.events = events;
		//   calendar.setOption('events', events); // Update the calendar events
		// });
	};

	let plugins = [DayGrid];
	let options = {
		view: 'dayGridMonth',
		events: [],
		dateSet: handleDateSet,
		buttonText: {
			today: 'Today'
		}
	};
</script>

<Calendar {plugins} {options} />
