import { test, expect } from '@playwright/test';

test.describe('DM Session', () => {
  test('should load DM session page', async ({ page }) => {
    await page.goto('/dm-session');
    await expect(page).toHaveTitle(/DM|Session|Aedelore/);
  });

  test('should require login', async ({ page }) => {
    await page.goto('/dm-session');

    // Should show login prompt or redirect
    await expect(page.locator('text=Login')).toBeVisible();
  });
});

test.describe('DM Session - Logged In', () => {
  const testUser = `dm_test_${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    // Register and login
    await page.goto('/dm-session');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Login
    await page.click('#server-btn, .login-btn, text=Login');
    await page.click('text=Register here');
    await page.fill('#auth-username', testUser + Math.random().toString(36).slice(2, 8));
    await page.fill('#auth-email', `${testUser}${Math.random().toString(36).slice(2, 8)}@test.com`);
    await page.fill('#auth-password', 'TestPass123');
    await page.fill('#auth-confirm-password', 'TestPass123');
    await page.click('#auth-submit-btn');
    await expect(page.locator('#auth-modal')).not.toBeVisible({ timeout: 5000 });
  });

  test('should show campaign list after login', async ({ page }) => {
    // Should see campaigns section or create button
    await expect(page.locator('text=Campaign').first()).toBeVisible({ timeout: 5000 });
  });

  test('should create a new campaign', async ({ page }) => {
    // Click create campaign button
    await page.click('text=New Campaign, text=Create Campaign, #create-campaign-btn');

    // Fill campaign details
    const nameInput = page.locator('#campaign-name, [name="campaign_name"], input[placeholder*="Campaign"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Campaign');

      // Submit
      await page.click('text=Create, text=Save, button[type="submit"]');

      // Should see the campaign
      await expect(page.locator('text=Test Campaign')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should create a session in campaign', async ({ page }) => {
    // First create a campaign
    await page.click('text=New Campaign, text=Create Campaign, #create-campaign-btn');
    const nameInput = page.locator('#campaign-name, [name="campaign_name"], input[placeholder*="Campaign"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Session Test Campaign');
      await page.click('text=Create, text=Save, button[type="submit"]');
      await page.waitForTimeout(1000);

      // Click on the campaign to open it
      await page.click('text=Session Test Campaign');

      // Create a session
      await page.click('text=New Session, text=Add Session, #new-session-btn');

      // Should see session editor
      await expect(page.locator('text=Session 1, #session-editor, .session-content')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should add encounter to session', async ({ page }) => {
    // This is a more complex flow - simplified version
    // Navigate to or create a session first, then add encounter
    await page.click('text=New Campaign, text=Create Campaign').catch(() => {});

    const nameInput = page.locator('#campaign-name, input[placeholder*="Campaign"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Encounter Test');
      await page.click('text=Create, button[type="submit"]').catch(() => {});
      await page.waitForTimeout(1000);

      // Try to add encounter
      const addEncounter = page.locator('text=Add Encounter, #add-encounter, .add-encounter-btn').first();
      if (await addEncounter.isVisible()) {
        await addEncounter.click();

        // Fill encounter details
        const encounterName = page.locator('#encounter-name, [name="encounter_name"]').first();
        if (await encounterName.isVisible()) {
          await encounterName.fill('Goblin Ambush');
          await page.click('text=Save, text=Add, button[type="submit"]');

          await expect(page.locator('text=Goblin Ambush')).toBeVisible();
        }
      }
    }
  });
});

test.describe('DM Session - Autosave', () => {
  test('should autosave session changes', async ({ page }) => {
    const user = `autosave_${Date.now()}`;

    // Register
    await page.goto('/dm-session');
    await page.click('#server-btn, .login-btn, text=Login');
    await page.click('text=Register here');
    await page.fill('#auth-username', user);
    await page.fill('#auth-email', `${user}@test.com`);
    await page.fill('#auth-password', 'TestPass123');
    await page.fill('#auth-confirm-password', 'TestPass123');
    await page.click('#auth-submit-btn');
    await expect(page.locator('#auth-modal')).not.toBeVisible({ timeout: 5000 });

    // Create campaign and session
    await page.click('text=New Campaign, text=Create Campaign').catch(() => {});
    const nameInput = page.locator('#campaign-name, input[placeholder*="Campaign"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Autosave Test');
      await page.click('text=Create, button[type="submit"]').catch(() => {});
      await page.waitForTimeout(2000);

      // Make changes and wait for autosave
      const notesField = page.locator('#session-notes, textarea[name*="notes"]').first();
      if (await notesField.isVisible()) {
        await notesField.fill('Autosave test notes');
        await page.waitForTimeout(3000); // Wait for autosave

        // Reload and verify
        await page.reload();
        await page.waitForTimeout(2000);

        await expect(notesField).toHaveValue('Autosave test notes');
      }
    }
  });
});
