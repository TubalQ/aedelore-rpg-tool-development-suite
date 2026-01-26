import { test, expect } from '@playwright/test';

test.describe('DM Session', () => {
  test('should load DM session page', async ({ page }) => {
    await page.goto('/dm-session');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/DM|Session|Aedelore/);
  });

  test('should show login required message', async ({ page }) => {
    await page.goto('/dm-session');
    await page.waitForLoadState('networkidle');

    // Should show login required message
    await expect(page.locator('#login-required')).toBeVisible();
    await expect(page.locator('text=Login Required')).toBeVisible();
  });
});
