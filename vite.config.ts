import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
		globals: true,
		environment: 'jsdom'
	},
	resolve: {
		alias: [
			{ find: '$', replacement: resolve(__dirname, './src') },
			{ find: '$components', replacement: resolve(__dirname, './src/components') }
		]
	}
});
