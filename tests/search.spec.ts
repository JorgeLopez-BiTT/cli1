import { test, expect } from '@playwright/test';

test.describe('Search functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://playwright.dev/');
  });

  test('opens search dialog on button click', async ({ page }) => {
    await page.getByRole('button', { name: 'Search (Ctrl+K)' }).click();

    const searchbox = page.getByRole('searchbox', { name: 'Search' });
    await expect(searchbox).toBeVisible();
    await expect(searchbox).toBeFocused();
  });

  test('opens search dialog with keyboard shortcut Ctrl+K', async ({ page }) => {
    await page.locator('body').click();
    await page.keyboard.press('Control+k');

    await expect(page.getByRole('searchbox', { name: 'Search' })).toBeVisible();
  });

  test('shows results when typing a query', async ({ page }) => {
    await page.getByRole('button', { name: 'Search (Ctrl+K)' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('locators');

    const firstResult = page.getByRole('link', { name: 'Locators', exact: true });
    await expect(firstResult).toBeVisible();
  });

  test('navigates to result page on selection', async ({ page }) => {
    await page.getByRole('button', { name: 'Search (Ctrl+K)' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('locators');

    await page.getByRole('link', { name: 'Locators', exact: true }).click();

    await expect(page).toHaveURL(/\/docs\/locators/);
    await expect(page.getByRole('heading', { name: 'Locators', level: 1 })).toBeVisible();
  });

  test('closes search dialog on Escape key', async ({ page }) => {
    await page.getByRole('button', { name: 'Search (Ctrl+K)' }).click();
    await expect(page.getByRole('searchbox', { name: 'Search' })).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByRole('searchbox', { name: 'Search' })).not.toBeVisible();
  });

  test('clears query with clear button', async ({ page }) => {
    await page.getByRole('button', { name: 'Search (Ctrl+K)' }).click();
    const searchbox = page.getByRole('searchbox', { name: 'Search' });
    await searchbox.fill('locators');
    await expect(searchbox).toHaveValue('locators');

    await page.getByRole('button', { name: 'Clear the query' }).click();

    await expect(searchbox).toHaveValue('');
  });
});