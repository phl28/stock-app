/* eslint-disable playwright/no-skipped-test */
import { test, expect, type Page } from '@playwright/test';

import { TRADEUP_URL } from './constants';

test.describe('Calculator Page', () => {
	test('Goto Calculator Page', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/calculator`);
		await expect(page).toHaveTitle('Trade Up - Stock Calculator');
		const chartGrid = page.getByTestId('calculator-chart');
		await chartGrid.waitFor();
	});

	test.describe('Change Stock Ticker to see a different stock chart', () => {
		let page: Page;
		test.beforeAll(async ({ browser }) => {
			page = await browser.newPage();
		});
		test.skip('Change from AAPL to MSFT', async () => {
			await page.goto(`${TRADEUP_URL}/calculator`);
			const chartGrid = page.getByTestId('calculator-chart');
			await chartGrid.waitFor();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).click();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).fill('MSFT');
			await page.getByRole('main').getByRole('button').click();
			const msftResponse = await page.waitForResponse((response) => {
				return response.url().includes('fetchStockData') && response.status() === 200;
			});
			const responseText = await msftResponse.text();
			expect(responseText).toContain('stockData');
			expect(responseText).toContain('volumeData');
			expect(responseText).toContain('MSFT');
		});

		test.skip("Check that case doesn't matter", async () => {
			const chartGrid = page.getByTestId('calculator-chart');
			await chartGrid.waitFor();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).click();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).fill('msft');
			await page.getByRole('main').getByRole('button').click();
			const msftResponse = await page.waitForResponse((response) => {
				return response.url().includes('fetchStockData') && response.status() === 200;
			});
			const responseText = await msftResponse.text();
			expect(responseText).toContain('stockData');
			expect(responseText).toContain('volumeData');
			expect(responseText).toContain('MSFT');
		});

		test.skip('Check that invalid ticker shows error toast and doesnt change chart', async () => {
			const chartGrid = page.getByTestId('calculator-chart');
			await chartGrid.waitFor();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).click();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).fill('ABCDEFGHIJKLMOPQRSTUP');
			await page.getByTestId('calculator-submit-button').click();
			await page.waitForResponse(
				(response) => response.url().includes('fetchStockData') && response.status() === 400
			);
			await expect(page.getByText('Ticker is missing/ invalid')).toBeVisible();
		});

		test.skip('If stock input is empty, the submit button should be disabled', async () => {
			const chartGrid = page.getByTestId('calculator-chart');
			await chartGrid.waitFor();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).click();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).clear();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).dispatchEvent('input');
			await expect(page.getByTestId('calculator-submit-button')).toBeDisabled({ timeout: 1000 });
		});
	});

	test.describe.serial('Stock Calculation Functionality', () => {
		let page: Page;
		test.beforeAll(async ({ browser }) => {
			page = await browser.newPage();
		});
		test('Default calculation values are displayed correctly', async () => {
			await page.goto(`${TRADEUP_URL}/calculator`);
			await expect(page.getByTestId('calculator-account-size-input')).toHaveValue('1000000');
			await expect(page.getByTestId('calculator-risk-input')).toHaveValue('0.3');
			await expect(page.getByTestId('calculator-entry-price-input')).toHaveValue('100');
			await expect(page.getByTestId('calculator-stop-loss-input')).toHaveValue('96');
			await expect(page.getByTestId('calculator-target-price-input')).toHaveValue('120');

			await expect(page.getByTestId('calculator-stop-loss-amt')).toContainText('$3000.00');
			await expect(page.getByTestId('calculator-stop-loss-perc')).toContainText('4.00%');

			await expect(page.getByTestId('calculator-position-size-amt')).toContainText('750 shares');
			await expect(page.getByTestId('calculator-position-size-perc')).toContainText(
				'7.50% of account'
			);

			await expect(page.getByTestId('calculator-profit-perc')).toContainText('20.00%');
			await expect(page.getByTestId('calculator-account-growth-perc')).toContainText(
				'Account growth: 1.50%'
			);

			await expect(page.getByTestId('calculator-risk-reward-ratio')).toContainText('5.00');
		});

		test('Updating account size recalculates position size correctly', async () => {
			await expect(page.getByTestId('calculator-account-size-input')).toBeVisible();
			// Change account size to $50,000
			await page.getByTestId('calculator-account-size-input').click();
			await page.getByTestId('calculator-account-size-input').fill('500000');
			await page.getByTestId('calculator-account-size-input').blur();

			// Position should be halved (from 750 to about 375 shares)
			await expect(page.getByTestId('calculator-position-size-amt')).toContainText('375 shares');

			// Stop loss amount should be halved (from $3000 to about $1500)
			await expect(page.getByTestId('calculator-stop-loss-amt')).toContainText('$1500.00');

			// Potential Growth and Risk Reward should not change
			await expect(page.getByTestId('calculator-profit-perc')).toContainText('20.00%');
			await expect(page.getByTestId('calculator-account-growth-perc')).toContainText(
				'Account growth: 1.50%'
			);

			await expect(page.getByTestId('calculator-risk-reward-ratio')).toContainText('5.00');
		});

		test('Updating risk percentage recalculates position size correctly', async () => {
			await expect(page.getByTestId('calculator-risk-input')).toBeVisible();
			// Change risk from 0.3% to 1%
			await page.getByTestId('calculator-risk-input').click();
			await page.getByTestId('calculator-risk-input').fill('1');
			await page.getByTestId('calculator-risk-input').blur();

			await expect(page.getByTestId('calculator-position-size-amt')).toContainText('1250 shares');

			await expect(page.getByTestId('calculator-stop-loss-amt')).toContainText('$5000.00');

			await expect(page.getByTestId('calculator-profit-perc')).toContainText('20.00%');
			await expect(page.getByTestId('calculator-account-growth-perc')).toContainText(
				'Account growth: 5.00%'
			);

			await expect(page.getByTestId('calculator-risk-reward-ratio')).toContainText('5.00');
		});

		test('Updating entry and stop loss prices recalculates stop loss percentage correctly', async () => {
			await expect(page.getByTestId('calculator-entry-price-input')).toBeVisible();
			// Change entry price to $120
			await page.getByTestId('calculator-entry-price-input').click();
			await page.getByTestId('calculator-entry-price-input').fill('120');
			await page.getByTestId('calculator-entry-price-input').blur();

			await expect(page.getByTestId('calculator-stop-loss-amt')).toContainText('$4992.00');
			await expect(page.getByTestId('calculator-stop-loss-perc')).toContainText('20.00%');

			await expect(page.getByTestId('calculator-position-size-amt')).toContainText('208 shares');
			await expect(page.getByTestId('calculator-position-size-perc')).toContainText(
				'5.00% of account'
			);

			await expect(page.getByTestId('calculator-profit-perc')).toContainText('0.00%');
			await expect(page.getByTestId('calculator-account-growth-perc')).toContainText('0.00%');

			await expect(page.getByTestId('calculator-risk-reward-ratio')).toContainText('0.00');

			// Change stop loss to $80
			await page.getByTestId('calculator-stop-loss-input').click();
			await page.getByTestId('calculator-stop-loss-input').fill('80');
			await page.getByTestId('calculator-stop-loss-input').blur();

			await expect(page.getByTestId('calculator-stop-loss-amt')).toContainText('$5000.00');
			await expect(page.getByTestId('calculator-stop-loss-perc')).toContainText('33.33%');

			await expect(page.getByTestId('calculator-position-size-amt')).toContainText('125 shares');
			await expect(page.getByTestId('calculator-position-size-perc')).toContainText(
				'3.00% of account'
			);

			await expect(page.getByTestId('calculator-profit-perc')).toContainText('0.00%');
			await expect(page.getByTestId('calculator-account-growth-perc')).toContainText('0.00%');

			await expect(page.getByTestId('calculator-risk-reward-ratio')).toContainText('0.00');
		});

		test('Updating target price recalculates potential profit correctly', async () => {
			// Change target price to $150
			await expect(page.getByTestId('calculator-target-price-input')).toBeVisible();
			await page.getByTestId('calculator-target-price-input').click();
			await page.getByTestId('calculator-target-price-input').fill('150');
			await page.getByTestId('calculator-target-price-input').blur();

			await expect(page.getByTestId('calculator-stop-loss-amt')).toContainText('$5000.00');
			await expect(page.getByTestId('calculator-stop-loss-perc')).toContainText('33.33%');

			await expect(page.getByTestId('calculator-position-size-amt')).toContainText('125 shares');
			await expect(page.getByTestId('calculator-position-size-perc')).toContainText(
				'3.00% of account'
			);

			await expect(page.getByTestId('calculator-profit-perc')).toContainText('25.00%');
			await expect(page.getByTestId('calculator-account-growth-perc')).toContainText('0.75%');

			await expect(page.getByTestId('calculator-risk-reward-ratio')).toContainText('0.75');
		});

		test('Negative values should not break calculations', async () => {
			await expect(page.getByTestId('calculator-entry-price-input')).toBeVisible();
			// Set entry price higher than target (negative profit)
			await page.getByTestId('calculator-entry-price-input').click();
			await page.getByTestId('calculator-entry-price-input').fill('120');
			await page.getByTestId('calculator-target-price-input').click();
			await page.getByTestId('calculator-target-price-input').fill('100');
			await page.getByTestId('calculator-target-price-input').blur();

			await expect(page.getByTestId('calculator-stop-loss-amt')).toContainText('$5000.00');
			await expect(page.getByTestId('calculator-stop-loss-perc')).toContainText('33.33%');

			await expect(page.getByTestId('calculator-position-size-amt')).toContainText('125 shares');
			await expect(page.getByTestId('calculator-position-size-perc')).toContainText(
				'3.00% of account'
			);

			await expect(page.getByTestId('calculator-profit-perc')).toContainText('-16.67%');
			await expect(page.getByTestId('calculator-account-growth-perc')).toContainText('0.00%');

			await expect(page.getByTestId('calculator-risk-reward-ratio')).toContainText('0.00');
		});

		test('Zero and extreme values handling', async () => {
			await expect(page.getByTestId('calculator-account-size-input')).toBeVisible();
			// Set account size to 0
			await page.getByTestId('calculator-account-size-input').click();
			await page.getByTestId('calculator-account-size-input').fill('0');
			await page.getByTestId('calculator-account-size-input').blur();

			// Position size should be 0 shares
			await expect(page.getByTestId('calculator-stop-loss-amt')).toContainText('$0.00');
			await expect(page.getByTestId('calculator-stop-loss-perc')).toContainText('33.33%');

			await expect(page.getByTestId('calculator-position-size-amt')).toContainText('0 shares');
			await expect(page.getByTestId('calculator-position-size-perc')).toContainText(
				'3.00% of account'
			);

			await expect(page.getByTestId('calculator-profit-perc')).toContainText('-16.67%');
			await expect(page.getByTestId('calculator-account-growth-perc')).toContainText('0.00%');

			await expect(page.getByTestId('calculator-risk-reward-ratio')).toContainText('0.00');

			// Set extremely large values
			await page.getByTestId('calculator-account-size-input').click();
			await page.getByTestId('calculator-account-size-input').fill('1000000000');
			await page.getByTestId('calculator-risk-input').fill('1');
			await page.getByTestId('calculator-risk-input').blur();

			await expect(page.getByTestId('calculator-stop-loss-amt')).toContainText('$10000000.00');
			await expect(page.getByTestId('calculator-stop-loss-perc')).toContainText('33.33%');

			await expect(page.getByTestId('calculator-position-size-amt')).toContainText('250000 shares');
			await expect(page.getByTestId('calculator-position-size-perc')).toContainText(
				'3.00% of account'
			);

			await expect(page.getByTestId('calculator-profit-perc')).toContainText('-16.67%');
			await expect(page.getByTestId('calculator-account-growth-perc')).toContainText('0.00%');

			await expect(page.getByTestId('calculator-risk-reward-ratio')).toContainText('0.00');
		});
	});
});
