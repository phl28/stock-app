import { writable } from 'svelte/store';

import type { Toast } from '$lib/types';

// Theme
const toggleDarkTheme = () => {
	// by default dark theme is off
	const { subscribe, update } = writable(false);

	return {
		subscribe,
		toggle: () => update((n) => !n)
	};
};

export const darkTheme = toggleDarkTheme();

// Toast
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

// Modal
type ModalState = {
	assignTradeModal: boolean;
	importTradeModal: boolean;
	addTradeModal: boolean;
	editPositionModal: boolean;
};

const initialState: ModalState = {
	assignTradeModal: false,
	importTradeModal: false,
	addTradeModal: false,
	editPositionModal: false
};

const modalStateStore = (initialState: ModalState) => {
	const modalState = writable<ModalState>(initialState);
	const { subscribe, update } = modalState;
	return {
		subscribe,
		toggleAssignTradeModal: () =>
			update((state) => ({
				...state,
				assignTradeModal: !state.assignTradeModal
			})),
		toggleImportTradeModal: () =>
			update((state) => ({
				...state,
				importTradeModal: !state.importTradeModal
			})),
		toggleAddTradeModal: () =>
			update((state) => ({
				...state,
				addTradeModal: !state.addTradeModal
			})),
		toggleEditPositionModal: () =>
			update((state) => ({
				...state,
				editPositionModal: !state.editPositionModal
			}))
	};
};

export const modalStore = modalStateStore(initialState);
