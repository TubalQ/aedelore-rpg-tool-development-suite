import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aedelore/);
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation elements using title attributes
    await expect(page.locator('a[title="Character Sheet"]')).toBeVisible();
    await expect(page.locator('a[title="DM Session"]')).toBeVisible();
  });

  test('should navigate to character sheet', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="character-sheet"]');
    await expect(page).toHaveURL(/character-sheet/);
  });

  test('should navigate to DM tools', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="dm-session"]');
    await expect(page).toHaveURL(/dm-session/);
  });
});
