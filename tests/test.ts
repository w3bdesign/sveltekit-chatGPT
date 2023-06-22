import { expect, test } from '@playwright/test';

test('Index page has expected h1 text', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'GPT-4 Chat' })).toBeVisible();
});

test('GPT Chat and text submission', async ({ page }) => {
	// Navigate to the page with the GPT Chat component
	await page.goto('/');

	// Ensure the page title is correct
	const pageTitle = await page.title();
	expect(pageTitle).toBe('Main - GPT-4 Chat');

	// Type user input into the textarea
	const userInput = 'Hi';
	await page.fill('textarea', userInput);

	// Wait for the AI response and check that the loading spinner is hidden
	await page.getByPlaceholder('Type something here to start ...');

	// Click the submit button
	await page.getByRole('button', { name: 'Submit' }).click();

	// Wait for the output message to appear on the page
	await page.waitForSelector('[data-testid="ai-response-container"]', { timeout: 10000 });

	// Check if there is at least one output message container
	const outputMessageContainer = await page.getByTestId('ai-response-container');

	expect(outputMessageContainer).toBeVisible;
});
