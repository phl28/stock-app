/* eslint-disable playwright/no-skipped-test */
import { test, expect } from '@playwright/test';

import { TRADEUP_URL } from './constants';

test.describe.configure({ mode: 'serial' });

test.describe('Calculator Page', () => {
	test('Goto Calculator Page', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/calculator`);
		await expect(page).toHaveTitle('Trade Up - Stock Calculator');
		const chartGrid = page.getByTestId('calculator-chart');
		await chartGrid.waitFor();
	});

	test.describe('Change Stock Ticker to see a different stock chart', () => {
		test.skip('Change from AAPL to MSFT', async ({ page }) => {
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

		test.skip("Check that case doesn't matter", async ({ page }) => {
			await page.goto(`${TRADEUP_URL}/calculator`);
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

		test.skip('Check that invalid ticker shows error toast and doesnt change chart', async ({
			page
		}) => {
			await page.goto(`${TRADEUP_URL}/calculator`);
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

		test.skip('If stock input is empty, the submit button should be disabled', async ({ page }) => {
			await page.goto(`${TRADEUP_URL}/calculator`);
			const chartGrid = page.getByTestId('calculator-chart');
			await chartGrid.waitFor();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).click();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).clear();
			await page.getByRole('textbox', { name: 'Stock Ticker' }).dispatchEvent('input');
			await expect(page.getByTestId('calculator-submit-button')).toBeDisabled({ timeout: 1000 });
		});
	});

	test.describe('Stock Calculation Functionality', () => {
		test('Default calculation values are displayed correctly', async ({ page }) => {
			await page.goto(`${TRADEUP_URL}/calculator`);

			await expect(page.getByRole('spinbutton', { name: 'Account Size (USD)' })).toHaveValue(
				'1000000'
			);
			await expect(page.getByRole('spinbutton', { name: 'Risk (%)' })).toHaveValue('0.3');
			await expect(page.getByRole('spinbutton', { name: 'Entry Price' })).toHaveValue('100');
			await expect(page.getByRole('spinbutton', { name: 'Stop Loss' })).toHaveValue('96');
			await expect(page.getByRole('spinbutton', { name: 'Target Price' })).toHaveValue('120');

			await expect(page.locator('.stat-value').nth(0)).toContainText('$3000.00');
			await expect(page.locator('.stat-desc').nth(0)).toContainText('4.00%');

			await expect(page.locator('.stat-value').nth(1)).toContainText('75 shares');
			await expect(page.locator('.stat-desc').nth(1)).toContainText('7.50% of account');

			await expect(page.locator('.stat-value').nth(2)).toContainText('20.00%');
			await expect(page.locator('.stat-desc').nth(2)).toContainText('Account growth: 1.50%');

			await expect(page.locator('.stat-value').nth(3)).toContainText('5.00');
		});

		test('Updating account size recalculates position size correctly', async ({ page }) => {
			await page.goto(`${TRADEUP_URL}/calculator`);

			// Change account size to $500,000
			await page.getByRole('spinbutton', { name: 'Account Size (USD)' }).click();
			await page.getByRole('spinbutton', { name: 'Account Size (USD)' }).clear();
			await page.getByRole('spinbutton', { name: 'Account Size (USD)' }).fill('500000');
			await page.getByRole('spinbutton', { name: 'Account Size (USD)' }).blur();

			// Position should be halved (from 75 to about 37-38 shares)
			await expect(page.locator('.stat-value').nth(1)).toContainText('37 shares');

			// Stop loss amount should be halved (from $300 to about $150)
			await expect(page.locator('.stat-value').nth(0)).toContainText('$150.00');
		});

		test('Updating risk percentage recalculates position size correctly', async ({ page }) => {
			await page.goto(`${TRADEUP_URL}/calculator`);

			// Change risk from 0.3% to 1%
			await page.getByRole('spinbutton', { name: 'Risk (%)' }).click();
			await page.getByRole('spinbutton', { name: 'Risk (%)' }).clear();
			await page.getByRole('spinbutton', { name: 'Risk (%)' }).fill('1');
			await page.getByRole('spinbutton', { name: 'Risk (%)' }).blur();

			// Position size should increase (from 75 to about 250 shares)
			await expect(page.locator('.stat-value').nth(1)).toContainText('250 shares');

			// Stop loss amount should increase (from $300 to about $1000)
			await expect(page.locator('.stat-value').nth(0)).toContainText('$1000.00');

			// Risk/reward ratio should change accordingly (from 5.00 to about 1.50)
			await expect(page.locator('.stat-value').nth(3)).toContainText('1.50');
		});

		test('Updating entry and stop loss prices recalculates stop loss percentage correctly', async ({
			page
		}) => {
			await page.goto(`${TRADEUP_URL}/calculator`);

			// Change entry price to $200
			await page.getByRole('spinbutton', { name: 'Entry Price' }).click();
			await page.getByRole('spinbutton', { name: 'Entry Price' }).clear();
			await page.getByRole('spinbutton', { name: 'Entry Price' }).fill('200');

			// Change stop loss to $190
			await page.getByRole('spinbutton', { name: 'Stop Loss' }).click();
			await page.getByRole('spinbutton', { name: 'Stop Loss' }).clear();
			await page.getByRole('spinbutton', { name: 'Stop Loss' }).fill('190');
			await page.getByRole('spinbutton', { name: 'Stop Loss' }).blur();

			// Stop loss percentage should be 5%
			await expect(page.locator('.stat-desc').nth(0)).toContainText('5.00%');

			// Position size should adjust based on the new stop loss percentage
			await expect(page.locator('.stat-desc').nth(1)).toContainText('6.00% of account');
		});

		test('Updating target price recalculates potential profit correctly', async ({ page }) => {
			await page.goto(`${TRADEUP_URL}/calculator`);

			// Change target price from $120 to $150
			await page.getByRole('spinbutton', { name: 'Target Price' }).click();
			await page.getByRole('spinbutton', { name: 'Target Price' }).clear();
			await page.getByRole('spinbutton', { name: 'Target Price' }).fill('150');
			await page.getByRole('spinbutton', { name: 'Target Price' }).blur();

			// Potential profit should increase from 20% to 50%
			await expect(page.locator('.stat-value').nth(2)).toContainText('50.00%');

			// Account growth should increase accordingly
			await expect(page.locator('.stat-desc').nth(2)).toContainText('Account growth: 3.75%');

			// Risk/reward ratio should increase (from 5.00 to about 12.50)
			await expect(page.locator('.stat-value').nth(3)).toContainText('12.50');
		});

		test('Full trade setup calculation with realistic values', async ({ page }) => {
			await page.goto(`${TRADEUP_URL}/calculator`);

			// Set up a realistic trade scenario
			await page.getByRole('spinbutton', { name: 'Account Size (USD)' }).fill('10000');
			await page.getByRole('spinbutton', { name: 'Risk (%)' }).fill('2');
			await page.getByRole('spinbutton', { name: 'Entry Price' }).fill('45.75');
			await page.getByRole('spinbutton', { name: 'Stop Loss' }).fill('43.50');
			await page.getByRole('spinbutton', { name: 'Target Price' }).fill('52.00');
			await page.getByRole('spinbutton', { name: 'Target Price' }).blur();

			// Verify stop loss amount and percentage
			await expect(page.locator('.stat-desc').nth(0)).toContainText('4.92%');

			// Verify position size
			await expect(page.locator('.stat-desc').nth(1)).toContainText('40.65% of account');

			// Verify potential profit and account growth
			await expect(page.locator('.stat-value').nth(2)).toContainText('13.66%');

			// Verify risk/reward ratio
			await expect(page.locator('.stat-value').nth(3)).toContainText(/2\.\d+/); // Should be approximately 2.7
		});

		test('Negative values should not break calculations', async ({ page }) => {
			await page.goto(`${TRADEUP_URL}/calculator`);

			// Set entry price higher than target (negative profit)
			await page.getByRole('spinbutton', { name: 'Entry Price' }).fill('120');
			await page.getByRole('spinbutton', { name: 'Target Price' }).fill('100');
			await page.getByRole('spinbutton', { name: 'Target Price' }).blur();

			// Profit should be negative
			await expect(page.locator('.stat-value').nth(2)).toContainText('-16.67%');

			// Risk/reward should be negative
			await expect(page.locator('.stat-value').nth(3)).toContainText('-');
		});

		test('Zero and extreme values handling', async ({ page }) => {
			await page.goto(`${TRADEUP_URL}/calculator`);

			// Set account size to 0
			await page.getByRole('spinbutton', { name: 'Account Size (USD)' }).fill('0');
			await page.getByRole('spinbutton', { name: 'Account Size (USD)' }).blur();

			// Position size should be 0 shares
			await expect(page.locator('.stat-value').nth(1)).toContainText('0 shares');

			// Set extremely large values
			await page.getByRole('spinbutton', { name: 'Account Size (USD)' }).fill('1000000000');
			await page.getByRole('spinbutton', { name: 'Risk (%)' }).fill('100');
			await page.getByRole('spinbutton', { name: 'Risk (%)' }).blur();

			// Values should still be calculated properly
			await expect(page.locator('.stat-desc').nth(1)).toContainText('2500.00% of account');
		});
	});
});
