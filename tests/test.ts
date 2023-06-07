import { expect, test } from '@playwright/test';

test('Index page has expected h1 text', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'GPT-4 Chat' })).toBeVisible();
});

