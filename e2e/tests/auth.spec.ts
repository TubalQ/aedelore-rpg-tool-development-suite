import { test, expect } from '@playwright/test';

// Generate unique username for each test run
const testUser = `e2e_test_${Date.now()}`;
const testPassword = 'TestPass123';
const testEmail = `${testUser}@test.com`;

test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('should show registration form', async ({ page }) => {
      await page.goto('/character-sheet');

      // Click login/cloud button to open auth modal
      await page.click('#server-btn');
      await expect(page.locator('#auth-modal')).toBeVisible();

      // Switch to register mode
      await page.click('text=Register here');
      await expect(page.locator('#auth-modal-title')).toHaveText('Register');
    });

    test('should register a new user', async ({ page }) => {
      await page.goto('/character-sheet');
      await page.click('#server-btn');
      await page.click('text=Register here');

      // Fill registration form
      await page.fill('#auth-username', testUser);
      await page.fill('#auth-email', testEmail);
      await page.fill('#auth-password', testPassword);
      await page.fill('#auth-confirm-password', testPassword);

      // Submit
      await page.click('#auth-submit-btn');

      // Should redirect/reload on success
      await expect(page.locator('#auth-modal')).not.toBeVisible({ timeout: 5000 });
    });

    test('should reject weak password', async ({ page }) => {
      await page.goto('/character-sheet');
      await page.click('#server-btn');
      await page.click('text=Register here');

      await page.fill('#auth-username', 'weakpassuser');
      await page.fill('#auth-email', 'weak@test.com');
      await page.fill('#auth-password', '123');
      await page.fill('#auth-confirm-password', '123');
      await page.click('#auth-submit-btn');

      // Should show error
      await expect(page.locator('#auth-error')).toContainText(/password/i);
    });

    test('should reject mismatched passwords', async ({ page }) => {
      await page.goto('/character-sheet');
      await page.click('#server-btn');
      await page.click('text=Register here');

      await page.fill('#auth-username', 'mismatchuser');
      await page.fill('#auth-email', 'mismatch@test.com');
      await page.fill('#auth-password', testPassword);
      await page.fill('#auth-confirm-password', 'DifferentPass123');
      await page.click('#auth-submit-btn');

      await expect(page.locator('#auth-error')).toContainText(/match/i);
    });
  });

  test.describe('Login', () => {
    test('should show login form', async ({ page }) => {
      await page.goto('/character-sheet');
      await page.click('#server-btn');

      await expect(page.locator('#auth-modal')).toBeVisible();
      await expect(page.locator('#auth-modal-title')).toHaveText('Login');
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto('/character-sheet');
      await page.click('#server-btn');

      await page.fill('#auth-username', 'nonexistent');
      await page.fill('#auth-password', 'wrongpassword');
      await page.click('#auth-submit-btn');

      await expect(page.locator('#auth-error')).toContainText(/invalid|error/i);
    });

    test('should login with valid credentials', async ({ page }) => {
      // First register a user
      const loginUser = `login_test_${Date.now()}`;
      await page.goto('/character-sheet');
      await page.click('#server-btn');
      await page.click('text=Register here');
      await page.fill('#auth-username', loginUser);
      await page.fill('#auth-email', `${loginUser}@test.com`);
      await page.fill('#auth-password', testPassword);
      await page.fill('#auth-confirm-password', testPassword);
      await page.click('#auth-submit-btn');
      await expect(page.locator('#auth-modal')).not.toBeVisible({ timeout: 5000 });

      // Clear localStorage to simulate logout
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      // Now login
      await page.click('#server-btn');
      await page.fill('#auth-username', loginUser);
      await page.fill('#auth-password', testPassword);
      await page.click('#auth-submit-btn');

      // Should close modal on success
      await expect(page.locator('#auth-modal')).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // Register and login first
      const logoutUser = `logout_test_${Date.now()}`;
      await page.goto('/character-sheet');
      await page.click('#server-btn');
      await page.click('text=Register here');
      await page.fill('#auth-username', logoutUser);
      await page.fill('#auth-email', `${logoutUser}@test.com`);
      await page.fill('#auth-password', testPassword);
      await page.fill('#auth-confirm-password', testPassword);
      await page.click('#auth-submit-btn');
      await expect(page.locator('#auth-modal')).not.toBeVisible({ timeout: 5000 });

      // Click logout
      await page.click('#server-btn');
      await page.click('text=Logout');

      // Should show login form again when clicking cloud
      await page.click('#server-btn');
      await expect(page.locator('#auth-modal-title')).toHaveText('Login');
    });
  });
});
