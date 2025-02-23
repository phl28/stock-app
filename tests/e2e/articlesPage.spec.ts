import { test, expect } from '@playwright/test';

import { TRADEUP_URL } from './constants';

test.describe.configure({ mode: 'serial' });

test.describe('Articles Page', () => {
	test('Goto Articles Page', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/articles/page/1`);
		await expect(page).toHaveTitle('Trading Articles & Insights');
	});

	test('Create new article', async ({ page }) => {});
});
