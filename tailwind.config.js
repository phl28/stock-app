/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				'base-100': 'hsl(var(--base-100))',
			},
			ringOffsetColor: {
				background: 'hsl(var(--background))',
				'base-100': 'hsl(var(--base-100))',
			}
		}
	},
	daisyui: {
		themes: ['light', 'dark']
	},
	plugins: [require('daisyui')]
};
