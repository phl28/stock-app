import { test, expect } from '@playwright/test';

import { TRADEUP_URL } from './constants';

test.describe.configure({ mode: 'serial' });
// const currentDate = new Date().toLocaleString('en-GB', { timeZone: 'UTC' }).split(', ')[0];

test.describe('Trades Page', () => {
	test('Goto Trades Page', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/trade/1`);
		await expect(page).toHaveTitle('Trade History & Positions');
	});

	test('Add Trades', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/trade/1`);
		await expect(page.getByRole('heading', { name: 'Positions (0)' })).toBeVisible();
		await page.getByTestId('trade-view-selector').selectOption('trades');
		await expect(page.getByRole('heading', { name: 'Trades (0)', exact: true })).toBeVisible();
		await page.getByTestId('navbar-add-trade-button').click();
		await expect(page.getByTestId('add-trade-modal-title')).toBeVisible();
		await expect(page.getByTestId('add-trade-modal-title')).toHaveText('Add new trade(s)');
	});
});
