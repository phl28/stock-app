import { test, expect, type Page } from '@playwright/test';

import { TRADEUP_URL } from './constants';

test.describe('Trades Page', () => {
	// async function cleanupTrades(page: Page) {
	// 	await page.goto(`${TRADEUP_URL}/trade/1`);

	// 	const tradeCountText = (await page.getByTestId('trade-view-selector').textContent()) || '';
	// 	const hasExistingTrades =
	// 		tradeCountText.includes('Trades (') && !tradeCountText.includes('Trades (0)');

	// 	if (hasExistingTrades) {
	// 		await page.getByTestId('trade-view-selector').selectOption('trades');

	// 		await page.getByTestId('select-all-trades-checkbox').check();

	// 		await page.getByTestId('delete-selected-trades-button').click();

	// 		await page.getByTestId('confirm-delete-button').click();

	// 		await expect(page.getByRole('heading', { name: 'Trades (0)', exact: true })).toBeVisible();
	// 	}
	// }

	// test.beforeAll(async ({ browser }) => {
	// 	const page = await browser.newPage();
	// 	try {
	// 		await cleanupTrades(page);
	// 	} finally {
	// 		await page.close();
	// 	}
	// });

	// test.afterAll(async ({ browser }) => {
	// 	const page = await browser.newPage();
	// 	try {
	// 		await cleanupTrades(page);
	// 	} finally {
	// 		await page.close();
	// 	}
	// });

	test('Goto Trades Page', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/trade/1`);
		await expect(page).toHaveTitle('Trade History & Positions');
		await expect(page.getByTestId('trade-view-selector')).toHaveValues(['trades', 'positions']);
	});
	test.describe.serial('Add Trades', () => {
		let page: Page;
		test.beforeAll(async ({ browser }) => {
			page = await browser.newPage();
		});
		test('Click Add Trade Button', async () => {
			await page.goto(`${TRADEUP_URL}/trade/1`);
			await expect(page.getByRole('heading', { name: 'Positions (0)' })).toBeVisible();
			await page.getByTestId('trade-view-selector').selectOption('trades');
			await expect(page.getByRole('heading', { name: 'Trades (0)', exact: true })).toBeVisible();
			await page.getByTestId('navbar-add-trade-button').click();
			await expect(page.getByTestId('add-trade-modal-title')).toBeVisible();
		});

		test('Check initial form', async () => {
			await expect(page.getByTestId('add-trade-modal-title')).toHaveText('Add new trade(s)');
			await expect(page.getByPlaceholder('AAPL')).toBeVisible();
			await expect(page.getByPlaceholder('100')).toBeVisible();
			await expect(page.getByPlaceholder('1')).toBeVisible();
			await expect(page.getByPlaceholder('1000')).toBeVisible();
			await expect(page.getByTestId('add-trade-modal-region-input')).toHaveValues([
				'US',
				'HK',
				'UK'
			]);
			await expect(page.getByTestId('add-trade-modal-currency-input')).toHaveValues([
				'USD',
				'HKD',
				'EUR',
				'GBP',
				'CNY'
			]);
			await expect(page.getByTestId('add-trade-modal-platform-input')).toHaveValues([
				'FUTU',
				'IBKR'
			]);
			await expect(page.getByTestId('add-trade-modal-side-input')).toHaveValues(['BUY', 'SELL']);
			await expect(page.getByTestId('add-trade-modal-add-another-input')).toBeChecked();
			await expect(page.getByTestId('add-trade-modal-add-button')).toBeDisabled();
			await expect(page.getByTestId('add-trade-modal-close-button')).toBeVisible();
			await page.getByTestId('add-trade-modal-close-button').click();
			await expect(page.getByRole('heading', { name: 'Trade Management' })).toBeVisible();
		});

		test('Add first trade', async () => {
			await page.getByTestId('navbar-add-trade-button').click();
			await page.getByTestId('add-trade-modal-ticker-input').click();
			await page.getByTestId('add-trade-modal-ticker-input').fill('AAPL');
			await expect(page.locator('#add-trade-modal').getByText('Region')).toBeVisible();
			await expect(page.locator('#add-trade-modal').getByText('Currency')).toBeVisible();
			await page.getByTestId('add-trade-modal-price-input').click();
			await page.getByTestId('add-trade-modal-price-input').fill('100');
			await page.getByTestId('add-trade-modal-volume-input').click();
			await page.getByTestId('add-trade-modal-volume-input').fill('10');
			await page.getByTestId('add-trade-modal-executedAt-input').fill('2025-02-27');
			await page.getByTestId('add-trade-modal-add-button').click();

			await expect(page.getByTestId('add-trade-modal-add-button')).toBeDisabled();
			await expect(page.getByTestId('add-trade-modal-ticker-input')).toBeEmpty();
		});

		test('Add second trade', async () => {
			await expect(page.getByTestId('add-trade-modal-add-button')).toBeDisabled();
			await page.getByTestId('add-trade-modal-ticker-input').click();
			await page.getByTestId('add-trade-modal-ticker-input').fill('AAPL');
			await expect(page.locator('#add-trade-modal').getByText('Region')).toBeVisible();
			await expect(page.locator('#add-trade-modal').getByText('Currency')).toBeVisible();
			await page.getByTestId('add-trade-modal-price-input').click();
			await page.getByTestId('add-trade-modal-price-input').fill('200');
			await page.getByTestId('add-trade-modal-volume-input').click();
			await page.getByTestId('add-trade-modal-volume-input').fill('10');
			await page.getByTestId('add-trade-modal-executedAt-input').fill('2025-02-28');
			await page.getByTestId('add-trade-modal-add-button').click();

			await expect(page.getByTestId('add-trade-modal-add-button')).toBeDisabled();
			await expect(page.getByTestId('add-trade-modal-ticker-input')).toBeEmpty();
		});

		test('Add third trade', async () => {
			await expect(page.getByTestId('add-trade-modal-add-button')).toBeDisabled();
			await page.getByTestId('add-trade-modal-ticker-input').click();
			await page.getByTestId('add-trade-modal-ticker-input').fill('MSFT');
			await expect(page.locator('#add-trade-modal').getByText('Region')).toBeVisible();
			await expect(page.locator('#add-trade-modal').getByText('Currency')).toBeVisible();
			await page.getByTestId('add-trade-modal-price-input').click();
			await page.getByTestId('add-trade-modal-price-input').fill('300');
			await page.getByTestId('add-trade-modal-fees-input').click();
			await page.getByTestId('add-trade-modal-fees-input').fill('1');
			await page.getByTestId('add-trade-modal-volume-input').click();
			await page.getByTestId('add-trade-modal-volume-input').fill('100');
			await page.getByTestId('add-trade-modal-executedAt-input').fill('2025-02-28');
			await page.getByTestId('add-trade-modal-add-another-input').uncheck();
			await page.getByTestId('add-trade-modal-add-button').click();

			await expect(page.getByText('Trade added successfully!')).toBeVisible();
			await expect(page.getByTestId('add-trade-modal-title')).toBeHidden();
			await expect(page.getByRole('heading', { name: 'Trade Management' })).toBeVisible();
		});
	});
});
