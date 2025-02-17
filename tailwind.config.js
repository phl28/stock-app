/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			animation: {
				'gradient': 'gradient 8s linear infinite',
				'float': 'float 3s ease-in-out infinite'
			},
			keyframes: {
				gradient: {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'left center'
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center'
					}
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				}
			}
		}
	},
	daisyui: {
		themes: [
			{
				tradeup: {
					'primary': '#2563eb',
					'primary-focus': '#1d4ed8',
					'secondary': '#0ea5e9',
					'accent': '#8b5cf6',
					'neutral': '#1f2937',
					'base-100': '#ffffff',
					'base-200': '#f3f4f6',
					'base-300': '#e5e7eb',
					'base-content': '#1f2937',
					'info': '#0ea5e9',
					'success': '#10b981',
					'warning': '#f59e0b',
					'error': '#ef4444'
				}
			}
		]
	},
	plugins: [require('daisyui')]
};
