import { test, expect } from '@playwright/test';

import { TRADEUP_URL } from './constants';

test.describe('Articles Page', () => {
	test('Goto Calculator Page', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/calculator`);
		await expect(page).toHaveTitle('Trade Up - Stock Calculator');
	});
});
