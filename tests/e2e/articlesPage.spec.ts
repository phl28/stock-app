import { test, expect } from '@playwright/test';

import { TRADEUP_URL } from './constants';

test.describe('Calculator Page', () => {
	test('Goto Articles Page', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/articles/page/1`);
		await expect(page).toHaveTitle('Trading Articles & Insights');
	});
});
