import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['tests/unit/components/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom'
	}
});
