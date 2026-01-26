import { test, expect } from '@playwright/test';

test.describe('Character Sheet', () => {
  test('should load character sheet page', async ({ page }) => {
    await page.goto('/character-sheet');
    await expect(page).toHaveTitle(/Character Sheet|Aedelore/);
  });

  test('should have page content', async ({ page }) => {
    await page.goto('/character-sheet');
    await page.waitForLoadState('networkidle');

    // Page should have main content
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Should have some visible content
    const content = await page.content();
    expect(content).toContain('Aedelore');
  });
});
