/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'svelte'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended'
	],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		project: './tsconfig.json',
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: {
					ts: '@typescript-eslint/parser',
					js: 'espree',
					typescript: '@typescript-eslint/parser'
				}
			}
		},
		{
			files: 'tests/e2e/**',
			extends: 'plugin:playwright/recommended'
		}
	]
};
