import { test, expect, type Page } from '@playwright/test';

import { TRADEUP_URL } from './constants';
import { extractNumberFromBrackets } from './testUtils';
import { mockPositions, mockTrades } from './mockData';

const tradeTableColumnsToCheck: Array<{
	colId: string;
	mockProperty: keyof (typeof mockTrades)[number];
}> = [
	{ colId: 'ticker', mockProperty: 'ticker' },
	{ colId: 'price', mockProperty: 'price' },
	{ colId: 'volume', mockProperty: 'volume' },
	{ colId: 'fees', mockProperty: 'fees' },
	{ colId: 'platform', mockProperty: 'platform' },
	{ colId: 'region', mockProperty: 'region' },
	{ colId: 'tradeSide', mockProperty: 'side' },
	{ colId: 'executedAt', mockProperty: 'executedAt' }
];

const positionsTableColumnsToCheck: Array<keyof (typeof mockPositions)[number]> = [
	'isShort',
	'ticker',
	'region',
	'platform',
	'numOfTrades',
	'totalVolume',
	'averageEntryPrice',
	'grossProfitLoss',
	'openedAt'
];

test.describe('Trades Page', () => {
	// @FIXME: Assume it is fine for now to move on but definitely come back later
	// async function cleanupTradesAndPositions(page: Page) {
	// 	await page.goto(`${TRADEUP_URL}/trade/1`);

	// 	// Check positions
	// 	await expect(page.getByTestId('position-nav-bar-title')).toBeVisible();
	// 	let positionCountText = await page.getByTestId('position-nav-bar-title').innerText();
	// 	let positionCount = extractNumberFromBrackets(positionCountText);

	// 	while (positionCount > 0) {
	// 		const positionRow = page.locator('.ag-center-cols-container .ag-row').first();
	// 		const positionId = await positionRow.getAttribute('row-id');
	// 		await positionRow.click();
	// 		await page.waitForURL(`${TRADEUP_URL}/position/${positionId}`);
	// 		await page.getByTestId('position-dropdown-button').click();
	// 		await page.getByTestId('position-dropdown-delete-button').click();
	// 		await page.waitForURL(`${TRADEUP_URL}/trade/1`);
	// 		await expect(page.getByText('Position deleted successfully!')).toBeVisible();

	// 		positionCountText = await page.getByTestId('position-nav-bar-title').innerText();
	// 		positionCount = extractNumberFromBrackets(positionCountText);
	// 	}
	// 	expect(extractNumberFromBrackets(positionCountText)).toBe(0);

	// 	// Check trades
	// 	await page.getByTestId('trade-view-selector').selectOption('trades');

	// 	await expect(page.getByTestId('history-nav-bar-title')).toBeVisible();
	// 	let tradesCountText = await page.getByTestId('history-nav-bar-title').innerText();
	// 	const tradesCount = extractNumberFromBrackets(tradesCountText);
	// 	if (tradesCount > 0) {
	// 		await page.getByRole('checkbox', { name: 'Column with Header Selection' }).check();
	// 		await page.getByTestId('history-nav-bar-delete-trades-button').click();
	// 		tradesCountText = await page.getByTestId('history-nav-bar-title').innerText();
	// 		expect(extractNumberFromBrackets(tradesCountText)).toBe(0);
	// 	}
	// }

	// test.beforeAll(async ({ browser }) => {
	// 	const page = await browser.newPage();
	// 	try {
	// 		await cleanupTradesAndPositions(page);
	// 	} finally {
	// 		await page.close();
	// 	}
	// });

	// test.afterAll(async ({ browser }) => {
	// 	const page = await browser.newPage();
	// 	try {
	// 		await cleanupTradesAndPositions(page);
	// 	} finally {
	// 		await page.close();
	// 	}
	// });

	test('Goto Trades Page', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/trade/1`);
		await expect(page).toHaveTitle('Trade History & Positions');
		await expect(page.getByTestId('trade-view-selector')).toHaveValue('positions');
	});
	test.describe.serial('Trades History and Positions', () => {
		let page: Page;
		test.beforeAll(async ({ browser }) => {
			page = await browser.newPage();
		});
		test('Click Add Trade Button', async () => {
			await page.goto(`${TRADEUP_URL}/trade/1`);
			await expect(page.getByRole('heading', { name: 'Positions (0)' })).toBeVisible();
			await page.getByTestId('trade-view-selector').click();
			await page.getByTestId('trade-view-selector').selectOption('trades');
			await expect(page.getByRole('heading', { name: 'Trades (0)', exact: true })).toBeVisible();
			await page.getByTestId('navbar-add-trade-button').click();
			await expect(page.getByTestId('add-trade-modal-title')).toBeVisible();
		});

		test('Check initial form', async () => {
			await expect(page.getByTestId('add-trade-modal-title')).toHaveText('Add new trade(s)');
			await expect(page.getByPlaceholder('AAPL')).toBeVisible();
			await expect(page.getByPlaceholder('100', { exact: true })).toBeVisible();
			await expect(page.getByPlaceholder('1', { exact: true })).toBeVisible();
			await expect(page.getByPlaceholder('1000', { exact: true })).toBeVisible();
			await expect(page.getByTestId('add-trade-modal-region-input')).toHaveValue('US');
			await expect(page.getByTestId('add-trade-modal-currency-input')).toHaveValue('USD');
			await expect(page.getByTestId('add-trade-modal-platform-input')).toHaveValue('FUTU');
			await expect(page.getByTestId('add-trade-modal-side-input')).toHaveValue('BUY');
			await expect(page.getByTestId('add-trade-modal-add-another-input')).toBeChecked();
			await expect(page.getByTestId('add-trade-modal-add-button')).toBeDisabled();
			await expect(page.getByTestId('add-trade-modal-close-button')).toBeVisible();
			await page.getByTestId('add-trade-modal-close-button').click();
			await expect(page.getByRole('heading', { name: 'Trade Management' })).toBeVisible();
		});

		test('Add first trade', async () => {
			const mockTrade = mockTrades[0];
			await page.getByTestId('navbar-add-trade-button').click();
			await page.getByTestId('add-trade-modal-ticker-input').click();
			await page.getByTestId('add-trade-modal-ticker-input').fill(mockTrade.ticker);
			await expect(page.locator('#add-trade-modal').getByText('Region')).toBeVisible();
			await expect(page.locator('#add-trade-modal').getByText('Currency')).toBeVisible();
			await page.getByTestId('add-trade-modal-price-input').click();
			// use .slice() to remove the dollar sign
			await page.getByTestId('add-trade-modal-price-input').fill(mockTrade.price.slice(1));
			await page.getByTestId('add-trade-modal-volume-input').click();
			await page.getByTestId('add-trade-modal-volume-input').fill(mockTrade.volume);
			await page.getByTestId('add-trade-modal-executedAt-input').fill(mockTrade.executedAt);
			await page.getByTestId('add-trade-modal-add-button').click();

			await expect(page.getByTestId('add-trade-modal-add-button')).toBeDisabled();
			await expect(page.getByTestId('add-trade-modal-ticker-input')).toBeEmpty();
		});

		test('Add second trade', async () => {
			const mockTrade = mockTrades[1];
			await expect(page.getByTestId('add-trade-modal-add-button')).toBeDisabled();
			await page.getByTestId('add-trade-modal-ticker-input').click();
			await page.getByTestId('add-trade-modal-ticker-input').fill(mockTrade.ticker);
			await expect(page.locator('#add-trade-modal').getByText('Region')).toBeVisible();
			await expect(page.locator('#add-trade-modal').getByText('Currency')).toBeVisible();
			await page.getByTestId('add-trade-modal-price-input').click();
			await page.getByTestId('add-trade-modal-price-input').fill(mockTrade.price.slice(1));
			await page.getByTestId('add-trade-modal-volume-input').click();
			await page.getByTestId('add-trade-modal-volume-input').fill(mockTrade.volume);
			await page.getByTestId('add-trade-modal-executedAt-input').fill(mockTrade.executedAt);
			await page.getByTestId('add-trade-modal-add-button').click();

			await expect(page.getByTestId('add-trade-modal-add-button')).toBeDisabled();
			await expect(page.getByTestId('add-trade-modal-ticker-input')).toBeEmpty();
		});

		test('Add third trade', async () => {
			const mockTrade = mockTrades[2];
			await expect(page.getByTestId('add-trade-modal-add-button')).toBeDisabled();
			await page.getByTestId('add-trade-modal-ticker-input').click();
			await page.getByTestId('add-trade-modal-ticker-input').fill(mockTrade.ticker);
			await expect(page.locator('#add-trade-modal').getByText('Region')).toBeVisible();
			await expect(page.locator('#add-trade-modal').getByText('Currency')).toBeVisible();
			await page.getByTestId('add-trade-modal-price-input').click();
			await page.getByTestId('add-trade-modal-price-input').fill(mockTrade.price.slice(1));
			await page.getByTestId('add-trade-modal-fees-input').click();
			await page.getByTestId('add-trade-modal-fees-input').fill(mockTrade.fees.slice(1));
			await page.getByTestId('add-trade-modal-volume-input').click();
			await page.getByTestId('add-trade-modal-volume-input').fill(mockTrade.volume);
			await page.getByTestId('add-trade-modal-executedAt-input').fill(mockTrade.executedAt);
			await page.getByTestId('add-trade-modal-add-another-input').uncheck();
			await page.getByTestId('add-trade-modal-add-button').click();

			await expect(page.getByText('Trade added successfully!')).toBeVisible();
			await expect(page.getByTestId('add-trade-modal-title')).toBeHidden();
			await expect(page.getByRole('heading', { name: 'Trade Management' })).toBeVisible();
		});

		// test('Import Trades', async () => {});

		test('Check trade details are correct in the table', async () => {
			const tradesCountText = await page.getByTestId('history-nav-bar-title').innerText();
			const tradesCount = extractNumberFromBrackets(tradesCountText);
			expect(tradesCount).toBe(3);
			const tradeRows = await page.locator('.ag-center-cols-container .ag-row').all();
			expect(tradeRows.length).toBe(3);
			tradeRows.forEach(async (row, idx) => {
				const trade = mockTrades.find((t) => t.expectedRowIndex === idx.toString());
				expect(trade).toBeDefined();
				if (!trade) return;
				for (const col of tradeTableColumnsToCheck) {
					const cell = row.locator(`.ag-cell[col-id="${col.colId}"]`);
					await expect(cell).toHaveText(trade[col.mockProperty]);
				}
			});
		});

		test("Check select all won't show assign button when there are multiple different tickers", async () => {
			await page.getByRole('checkbox', { name: 'Column with Header Selection' }).check();
			await expect(page.getByTestId('history-nav-bar-assign-trades-button')).toBeHidden();
			await expect(page.getByTestId('history-nav-bar-delete-trades-button')).toBeVisible();
		});

		test('Delete trade', async () => {
			const msftSelector = page.locator(
				'.ag-center-cols-container .ag-row[row-id="0"] .ag-cell[col-id="ag-Grid-SelectionColumn"]'
			);
			await msftSelector.check();
			await page.getByTestId('history-nav-bar-delete-trades-button').click();
			const tradesCountText = await page.getByTestId('history-nav-bar-title').innerText();
			const tradesCount = extractNumberFromBrackets(tradesCountText);
			expect(tradesCount).toBe(2);
		});

		test('Assign Trades to Position', async () => {
			await page.getByRole('checkbox', { name: 'Column with Header Selection' }).check();
			await expect(page.getByTestId('history-nav-bar-assign-trades-button')).toBeVisible();
			await expect(page.getByTestId('history-nav-bar-delete-trades-button')).toBeVisible();
			await page.getByTestId('history-nav-bar-assign-trades-button').click();
			await expect(page.getByTestId('assign-position-modal-title')).toBeVisible();
			await expect(page.getByTestId('assign-position-modal-title')).toHaveText(
				'Assign the selected trades to a position'
			);
			await expect(page.getByTestId('assign-position-modal-add-button')).toBeDisabled();
			await page.getByTestId('trade-view-selector').click();
			await page.getByTestId('assign-position-modal-position-select').selectOption('newPosition');
			await expect(page.getByTestId('assign-position-modal-short-toggle')).toBeVisible();
			await expect(page.getByTestId('assign-position-modal-short-toggle')).not.toBeChecked();
			await page.getByTestId('assign-position-modal-short-toggle').check();
			await expect(page.getByTestId('assign-position-modal-short-toggle')).toBeChecked();
			await page.getByTestId('assign-position-modal-short-toggle').uncheck();
			await expect(page.getByTestId('assign-position-modal-short-toggle')).not.toBeChecked();
			await expect(page.getByTestId('assign-position-modal-add-button')).toBeEnabled();
			await page.getByTestId('assign-position-modal-add-button').click();
			await expect(page.getByText('Trades assigned to position')).toBeVisible();
			const tradesCountText = await page.getByTestId('history-nav-bar-title').innerText();
			const tradesCount = extractNumberFromBrackets(tradesCountText);
			expect(tradesCount).toBe(0);
		});

		test('Go to position tab', async () => {
			await page.getByTestId('trade-view-selector').click();
			await page.getByTestId('trade-view-selector').selectOption('positions');
			const positionCountText = await page.getByTestId('position-nav-bar-title').innerText();
			const positionCount = extractNumberFromBrackets(positionCountText);
			expect(positionCount).toBe(mockPositions.length);
		});

		test('Check position details are correct in the table', async () => {
			const positionRows = await page.locator('.ag-center-cols-container .ag-row').all();
			expect(positionRows.length).toBe(mockPositions.length);
			positionRows.forEach(async (row, idx) => {
				const position = mockPositions.find((t) => t.expectedRowIndex === idx.toString());
				expect(position).toBeDefined();
				if (!position) return;
				for (const col of positionsTableColumnsToCheck) {
					if (!col) return;
					const cell = row.locator(`.ag-cell[col-id="${col}"]`);
					let expectedValue = position[col];
					if (!expectedValue) return;
					if (col === 'isShort') {
						expectedValue = expectedValue ? 'SHORT' : 'LONG';
					}
					await expect(cell).toHaveText(expectedValue);
				}
			});
		});

		test('Click into a position', async () => {
			const position = mockPositions[0];
			const positionRow = page.locator('.ag-center-cols-container .ag-row').first();
			const positionId = await positionRow.getAttribute('row-id');
			await positionRow.click();
			await page.waitForURL(`${TRADEUP_URL}/position/${positionId}`);
			await expect(page.getByTestId('position-page-title')).toContainText(
				`${position.ticker} ${position.isShort ? 'Short' : 'Long'}`
			);
		});

		test('Check position individual trade details are still correct in the position page', async () => {
			await expect(page.locator('.ag-root-wrapper')).toBeVisible();
			const tradeRows = await page.locator('.ag-center-cols-container .ag-row').all();
			expect(tradeRows.length).toBe(mockPositions[0].numOfTrades);
			tradeRows.forEach(async (row, idx) => {
				const trade = mockTrades[idx];
				expect(trade).toBeDefined();
				if (!trade) return;
				for (const col of ['executedAt', 'price', 'fees', 'volume'] as const) {
					if (!col) return;
					const cell = row.locator(`.ag-cell[col-id="${col}"]`);
					await expect(cell).toHaveText(trade[col]);
				}
			});
		});

		test('Check risk reward of a trade', async () => {
			await expect(page.getByTestId('position-page-rr-input')).toHaveValue('-1');
			await expect(page.getByTestId('position-page-profit-target-input')).toBeEmpty();
			await expect(page.getByTestId('position-page-stop-loss-input')).toBeEmpty();
			await page.getByTestId('position-page-stop-loss-input').click();
			await page.getByTestId('position-page-stop-loss-input').fill('140');
			await page.getByTestId('position-page-stop-loss-input').blur();
			await expect(page.getByTestId('position-page-rr-input')).toBeDisabled();
			await expect(page.getByTestId('position-page-rr-input')).toHaveValue('-1');
			await page.getByTestId('position-page-profit-target-input').click();
			await page.getByTestId('position-page-profit-target-input').fill('160');
			await page.getByTestId('position-page-profit-target-input').blur();
			await expect(page.getByTestId('position-page-rr-input')).toBeDisabled();
			await expect(page.getByTestId('position-page-rr-input')).toHaveValue('1');
			await page.getByTestId('position-page-profit-target-input').click();
			await page.getByTestId('position-page-profit-target-input').fill('170');
			await page.getByTestId('position-page-profit-target-input').blur();
			await expect(page.getByTestId('position-page-rr-input')).toBeDisabled();
			await expect(page.getByTestId('position-page-rr-input')).toHaveValue('2');
			await page.getByTestId('position-page-rr-input').click();
			await page.getByTestId('position-page-rr-input').fill('4');
			await page.getByTestId('position-page-rr-input').blur();
			await expect(page.getByTestId('position-page-profit-target-input')).toBeDisabled();
			await expect(page.getByTestId('position-page-profit-target-input')).toHaveValue('190');
		});

		test('Edit position using the edit position modal', async () => {
			await page.getByTestId('position-dropdown-button').click();
			await expect(page.getByTestId('position-dropdown-edit-button')).toContainText(
				'Edit Position'
			);
			await page.getByTestId('position-dropdown-edit-button').click();
			await expect(page.getByTestId('edit-position-modal-ticker-input')).toBeDisabled();
			await expect(page.getByTestId('edit-position-modal-platform-input')).toBeDisabled();
			await expect(page.getByTestId('edit-position-modal-close-button')).toBeEnabled();
			await expect(page.getByTestId('edit-position-modal-save-button')).toBeDisabled();
			await expect(page.getByTestId('edit-position-modal-reset-button')).toBeDisabled();
			const tradeFirstRow = page.locator('.ag-center-cols-container .ag-row').first();
			const cell = tradeFirstRow.locator(`.ag-cell[col-id=volume"]`);
			await cell.dblclick();
			await page.getByRole('spinbutton', { name: 'Input Editor' }).fill('15');
			await page.getByRole('spinbutton', { name: 'Input Editor' }).press('Enter');
			await page.getByTestId('edit-position-modal-save-button').click();
			await expect(page.getByText('Trades updated successfully!')).toBeVisible();
			await expect(page.getByRole('main')).toContainText('Quantity 250');
		});

		test('Update position journal', async () => {
			await expect(page.getByTestId('editor')).toBeVisible();
			await page.locator('.ce-paragraph').click();
			await page.locator('.ce-paragraph').fill('Test Journal Content');
			await page.reload();
			// to check that this is saved
			await expect(page.getByTestId('editor')).toContainText('Test Journal Content');
		});

		test('Mark position as reviewed', async () => {
			await expect(page.getByTestId('position-page-mark-reviewed-button')).toBeVisible();
			await page.getByTestId('position-page-mark-reviewed-button').click();
			await expect(page.getByTestId('position-page-mark-reviewed-button')).toBeDisabled();
		});

		test('Delete the position', async () => {
			await page.getByTestId('position-dropdown-button').click();
			await expect(page.getByTestId('position-dropdown-delete-button')).toContainText(
				'Delete Position'
			);
			await page.getByTestId('position-dropdown-delete-button').click();
		});
	});
});
