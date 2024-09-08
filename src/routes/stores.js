import { writable } from 'svelte/store';

function toggleDarkTheme() {
    // by default dark theme is off	
	const { subscribe, update } = writable(false);

	return {
		subscribe,
		toggle: (() => update(n => !n)),
	};
}

export const theme = toggleDarkTheme();
