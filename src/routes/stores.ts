import { writable } from 'svelte/store';
import type { Toast } from '$lib/types';

const toggleDarkTheme = () => {
	// by default dark theme is off
	const { subscribe, update } = writable(false);

	return {
		subscribe,
		toggle: () => update((n) => !n)
	};
};

export const darkTheme = toggleDarkTheme();

export const toasts = writable<Toast[]>([]);

export const dispatchToast = (toast: Omit<Toast, 'id'>) => {
	const id = Math.floor(Math.random() * 10000);

	const defaults = {
		id,
		type: 'info',
		message: ''
	};

	toasts.update((all) => [{ ...defaults, ...toast }, ...all]);
};

export const dismissToast = (id: number) => {
	toasts.update((all) => all.filter((t) => t.id !== id));
};
