import { writable } from 'svelte/store';

function toggleDarkTheme() {
    // by default dark theme is on
	const { subscribe, update } = writable(true);

	return {
		subscribe,
		toggle: (() => update(n => !n)),
	};
}

export const theme = toggleDarkTheme();
