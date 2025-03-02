import { test, expect } from '@playwright/test';

import { TRADEUP_URL } from './constants';

test.describe.configure({ mode: 'serial' });
const currentDate = new Date().toLocaleString('en-GB', { timeZone: 'UTC' }).split(', ')[0];

test.describe('Articles Page', () => {
	test('Goto Articles Page', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/articles/page/1`);
		await expect(page).toHaveTitle('Trading Articles & Insights');
	});

	test('Create new article', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/articles/page/1`);
		await expect(page.getByRole('button', { name: 'New Article' })).toBeVisible();
		await page.getByRole('button', { name: 'New Article' }).click();
		await expect(page.getByText('Title')).toBeVisible();
		await expect(page.locator('#article-editor')).toBeVisible();
		await expect(page.locator('.ce-paragraph')).toBeVisible();
		await expect(page.locator('label').filter({ hasText: 'Publish' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await page.getByRole('button', { name: 'Save' }).click();
		// Navigate back to Articles page to see if article was created
		await page.goto(`${TRADEUP_URL}/articles/page/1`);
		await expect(page.getByRole('heading', { name: currentDate, exact: true })).toBeVisible();
		await expect(page.getByText('Draft')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Read More' })).toBeVisible();
	});

	test('Edit article title and content and check it is saved', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/articles/page/1`);
		await page.getByRole('link', { name: 'Read More' }).click();
		await page.getByTestId('edit-article-button').click();
		await page.getByRole('textbox', { name: 'Title' }).click();
		await page.getByRole('textbox', { name: 'Title' }).fill('Test Title');
		await page.locator('.ce-paragraph').click();
		await page.locator('.ce-paragraph').fill('Test Content');
		await page.getByRole('button', { name: 'Save' }).click();
		await expect(page.locator('body')).toContainText('Article saved successfully!');
		await page.goto(`${TRADEUP_URL}/articles/page/1`);
		await expect(page.locator('h2')).toContainText('Test Title');
		await page.getByRole('link', { name: 'Read More' }).click();
		await expect(page.locator('#article-editor')).toContainText('Test Content');
	});

	test('Publish article', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/articles/page/1`);
		await page.getByRole('link', { name: 'Read More' }).click();
		await page.getByTestId('edit-article-button').click();
		await page.getByRole('checkbox', { name: 'Publish' }).check();
		await page.getByRole('button', { name: 'Save' }).click();
		await expect(page.locator('body')).toContainText('Article published successfully!');
		await expect(page.locator('body')).toContainText('Article saved successfully!');
		await page.goto(`${TRADEUP_URL}/articles/page/1`);
		await expect(page.getByText('Published')).toBeVisible();
	});

	test('Delete article', async ({ page }) => {
		await page.goto(`${TRADEUP_URL}/articles/page/1`);
		await page.getByRole('link', { name: 'Read More' }).click();
		page.once('dialog', async (dialog) => {
			expect(dialog.message()).toBe('Are you sure you want to delete this article?');
			await dialog.accept().catch(() => {});
		});
		await page.getByTestId('delete-article-button').click();
		await page.waitForURL(`${TRADEUP_URL}/articles/page/1`);
		await expect(page.locator('section')).toContainText('Article deleted successfully!');
		await expect(page.getByRole('heading', { name: 'Test Title', exact: true })).toBeHidden();
	});
});
