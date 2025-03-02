import { test as setup } from '@playwright/test';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { TRADEUP_URL } from './constants';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
	const testEmail = process.env.CLERK_E2E_TEST_EMAIL;
	const testPassword = process.env.CLERK_E2E_TEST_PASSWORD;
	if (!testEmail || !testPassword) {
		throw new Error('Missing environment variables');
	}
	await page.goto(TRADEUP_URL);
	await page.getByText('Sign in').click();
	await page.getByRole('textbox', { name: 'Email address' }).click();
	await page.getByRole('textbox', { name: 'Email address' }).fill(testEmail);
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('textbox', { name: 'Password' }).click();
	await page.getByRole('textbox', { name: 'Password' }).fill(testPassword);
	await page.getByRole('button', { name: 'Continue' }).click();

	await page.waitForURL(`${TRADEUP_URL}/trade/1`);

	await page.context().storageState({ path: authFile });
});
