import { test, expect } from '@playwright/test';

test.describe('API Health', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('postgresql');
  });
});

// Tests that don't need authentication
test.describe('API Authentication - Negative Tests', () => {
  test('should reject invalid credentials', async ({ page, context }) => {
    await page.goto('/character-sheet');

    const cookies = await context.cookies();
    const csrfCookie = cookies.find(c => c.name === 'csrf_token');
    const csrfToken = csrfCookie!.value;

    const result = await page.evaluate(async ({ csrf }) => {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
        },
        credentials: 'include',
        body: JSON.stringify({
          username: 'nonexistent_user_12345',
          password: 'wrongpassword',
        }),
      });
      return { ok: res.ok, status: res.status };
    }, { csrf: csrfToken });

    expect(result.ok).toBe(false);
    expect([401, 429]).toContain(result.status);
  });
});

// All authentication tests run serially to avoid rate limiting
test.describe.serial('API Authentication - Full Flow', () => {
  let authToken: string;
  let testUser: string;
  let charId: number;
  let csrfToken: string;

  test('should register a new user', async ({ page, context }) => {
    await page.goto('/character-sheet');

    const cookies = await context.cookies();
    const csrfCookie = cookies.find(c => c.name === 'csrf_token');
    expect(csrfCookie).toBeDefined();
    csrfToken = csrfCookie!.value;

    testUser = `e2e_${Date.now()}`;

    const regResult = await page.evaluate(async ({ user, csrf }) => {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
        },
        credentials: 'include',
        body: JSON.stringify({
          username: user,
          password: 'TestPass123',
          email: `${user}@test.com`,
        }),
      });
      return { ok: res.ok, status: res.status, body: await res.json() };
    }, { user: testUser, csrf: csrfToken });

    expect(regResult.ok).toBe(true);
    expect(regResult.body.success).toBe(true);
    expect(regResult.body.token).toBeDefined();

    authToken = regResult.body.token;
  });

  test('should login with registered user', async ({ page, context }) => {
    await page.goto('/character-sheet');

    const cookies = await context.cookies();
    const csrfCookie = cookies.find(c => c.name === 'csrf_token');
    csrfToken = csrfCookie!.value;

    const loginResult = await page.evaluate(async ({ user, csrf }) => {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
        },
        credentials: 'include',
        body: JSON.stringify({
          username: user,
          password: 'TestPass123',
        }),
      });
      return { ok: res.ok, status: res.status, body: await res.json() };
    }, { user: testUser, csrf: csrfToken });

    expect(loginResult.ok).toBe(true);
    expect(loginResult.body.success).toBe(true);
    expect(loginResult.body.token).toBeDefined();

    // Update token with fresh login token
    authToken = loginResult.body.token;
  });

  test('should create a character', async ({ page, context }) => {
    await page.goto('/character-sheet');

    const cookies = await context.cookies();
    const csrfCookie = cookies.find(c => c.name === 'csrf_token');
    csrfToken = csrfCookie!.value;

    const createResult = await page.evaluate(async ({ token, csrf }) => {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrf,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: 'E2E Test Hero',
          data: { strength: 18, dexterity: 14, constitution: 16 },
          system: 'aedelore',
        }),
      });
      return { ok: res.ok, status: res.status, body: await res.json() };
    }, { token: authToken, csrf: csrfToken });

    expect(createResult.ok).toBe(true);
    expect(createResult.body.id).toBeDefined();

    charId = createResult.body.id;
  });

  test('should list characters', async ({ page }) => {
    await page.goto('/character-sheet');

    const listResult = await page.evaluate(async ({ token }) => {
      const res = await fetch('/api/characters', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      return { ok: res.ok, body: await res.json() };
    }, { token: authToken });

    expect(listResult.ok).toBe(true);
    expect(Array.isArray(listResult.body)).toBe(true);
    expect(listResult.body.length).toBeGreaterThan(0);
    expect(listResult.body.some((c: { name: string }) => c.name === 'E2E Test Hero')).toBe(true);
  });

  test('should get character by id', async ({ page }) => {
    await page.goto('/character-sheet');

    const getResult = await page.evaluate(async ({ token, id }) => {
      const res = await fetch(`/api/characters/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      return { ok: res.ok, body: await res.json() };
    }, { token: authToken, id: charId });

    expect(getResult.ok).toBe(true);
    expect(getResult.body.name).toBe('E2E Test Hero');
  });

  test('should update character', async ({ page, context }) => {
    await page.goto('/character-sheet');

    const cookies = await context.cookies();
    const csrfCookie = cookies.find(c => c.name === 'csrf_token');
    csrfToken = csrfCookie!.value;

    const updateResult = await page.evaluate(async ({ token, csrf, id }) => {
      const res = await fetch(`/api/characters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrf,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: 'Updated E2E Hero',
          data: { strength: 20, dexterity: 14, constitution: 16 },
          system: 'aedelore',
        }),
      });
      return { ok: res.ok, body: await res.json() };
    }, { token: authToken, csrf: csrfToken, id: charId });

    expect(updateResult.ok).toBe(true);
  });

  test('should delete character', async ({ page, context }) => {
    await page.goto('/character-sheet');

    const cookies = await context.cookies();
    const csrfCookie = cookies.find(c => c.name === 'csrf_token');
    csrfToken = csrfCookie!.value;

    const deleteResult = await page.evaluate(async ({ token, csrf, id }) => {
      const res = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrf,
        },
        credentials: 'include',
      });
      return { ok: res.ok };
    }, { token: authToken, csrf: csrfToken, id: charId });

    expect(deleteResult.ok).toBe(true);

    // Verify character is deleted
    const getResult = await page.evaluate(async ({ token, id }) => {
      const res = await fetch(`/api/characters/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      return { ok: res.ok, status: res.status };
    }, { token: authToken, id: charId });

    expect(getResult.ok).toBe(false);
    expect(getResult.status).toBe(404);
  });
});
