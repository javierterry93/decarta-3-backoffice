import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			globals: globals.browser,
		},
	},
	{
		files: ['src/components/**/*.{ts,tsx}', 'src/layouts/**/*.{ts,tsx}'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['**/services/**', '**/store/**'],
							message:
								'Solo las pages pueden importar services o store. Usa props/callbacks.',
						},
					],
				},
			],
		},
	},
	{
		files: ['src/services/**/*.{ts,tsx}'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['**/components/**', '**/layouts/**', 'react'],
							message:
								'Los services no deben importar React ni componentes UI.',
						},
					],
				},
			],
		},
	},
]);
