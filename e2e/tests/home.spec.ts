import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aedelore/);
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation elements
    await expect(page.locator('text=Character Sheet')).toBeVisible();
    await expect(page.locator('text=DM Tools')).toBeVisible();
  });

  test('should navigate to character sheet', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Character Sheet');
    await expect(page).toHaveURL(/character-sheet/);
  });

  test('should navigate to DM tools', async ({ page }) => {
    await page.goto('/');
    await page.click('text=DM Tools');
    await expect(page).toHaveURL(/dm-session/);
  });
});
