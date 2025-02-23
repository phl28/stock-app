import { test, expect } from '@playwright/test';

import { TRADEUP_URL } from './constants';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Home Page', () => {
	test('Should see navigation, links and title', async ({ page }) => {
		await page.goto(TRADEUP_URL);
		await expect(page.getByRole('link', { name: 'TradeUp' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Calculator' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Trade', exact: true })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Articles' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Smart Trading Made Simple' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Start Trading' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Learn More' })).toBeVisible();
	});

	test('Should be able to navigate to calculator page using navigation link', async ({ page }) => {
		await page.goto(TRADEUP_URL);
		await page.getByRole('link', { name: 'Calculator' }).click();
		await expect(page).toHaveURL(/calculator/);
		await expect(page.getByRole('heading', { name: 'Stock Calculator' })).toBeVisible();
	});

	test('Should be able to navigate to trade page using navigation link', async ({ page }) => {
		await page.goto(TRADEUP_URL);
		await page.getByRole('link', { name: 'Trade', exact: true }).click();
		await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 5000 });
		await expect(page.getByRole('heading', { name: 'Trade Management' })).toBeHidden();
	});

	test('Should be able to navigate to trade page using start trading button', async ({ page }) => {
		await page.goto(TRADEUP_URL);
		await page.getByRole('link', { name: 'Start Trading' }).click();
		await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 5000 });
		await expect(page.getByRole('heading', { name: 'Trade Management' })).toBeHidden();
	});

	test('Should be able to navigate to articles page using navigation link', async ({ page }) => {
		await page.goto(TRADEUP_URL);
		await page.getByRole('link', { name: 'Articles' }).click();
		await page.waitForURL(`${TRADEUP_URL}/articles/page/1`);
		await expect(page.getByRole('heading', { name: 'Trading Insights' })).toBeVisible();
	});

	test('Should be able to navigate to the articles page from the learn more button', async ({
		page
	}) => {
		await page.goto(TRADEUP_URL);
		await page.getByRole('link', { name: 'Learn More' }).click();
		await page.waitForURL(`${TRADEUP_URL}/articles/page/1`);
		await expect(page.getByRole('heading', { name: 'Trading Insights' })).toBeVisible();
	});
});
