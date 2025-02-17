/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			animation: {
				'gradient': 'gradient 8s linear infinite',
				'float': 'float 3s ease-in-out infinite',
				'scale-hover': 'scale 0.3s ease-in-out'
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
				},
				scale: {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
					'100%': { transform: 'scale(1)' }
				}
			},
			boxShadow: {
				'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
				'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
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
