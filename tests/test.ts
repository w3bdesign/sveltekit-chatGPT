import { expect, test } from '@playwright/test';

test('Index page has expected h1 text', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'GPT-4 Chat' })).toBeVisible();
});

test('We get text back when we click the button', async ({ page }) => {
	await page.goto('/');

	await page.exposeFunction('handleSSEMessage', async (data: any) => {
		if (data.choices && data.choices[0] && data.choices[0].text) {
			await expect(page.locator('div[data-testid="output-text-container"]')).toContainText(
				data.choices[0].text,
				{ timeout: 10000 }
			);
		}
	});

	await page.getByPlaceholder('Type something here to start ...').click();
	await page.getByPlaceholder('Type something here to start ...').fill('hello');
	await page.getByRole('button', { name: 'Submit' }).click();

	await page.waitForFunction(
		() => {
			const el = document.querySelector('div[data-testid="output-text-container"]');
			return el && el.textContent?.includes('Hello! How can I help you today?');
		},
		{ timeout: 10000 }
	);

	await expect(page.getByText('Hello! How can I help you today?')).toBeVisible({ timeout: 10000 });
});
