import { test, expect } from '@playwright/test';

test.describe('Authentication Page', () => {
  test('should load character sheet page with auth elements', async ({ page }) => {
    await page.goto('/character-sheet');
    await page.waitForLoadState('networkidle');

    // Page should load successfully
    await expect(page).toHaveTitle(/Character Sheet|Aedelore/);

    // Page should have auth-related content
    const content = await page.content();
    expect(content).toContain('Login');
    expect(content).toContain('Register');
  });
});
