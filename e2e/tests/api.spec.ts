import { test, expect, request } from '@playwright/test';

test.describe('API Health', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('postgresql');
  });
});

test.describe('API Authentication', () => {
  const testUser = `api_test_${Date.now()}`;
  const testPassword = 'ApiTest123';
  const testEmail = `${testUser}@test.com`;
  let authToken: string;
  let csrfToken: string;

  test('should register a new user via API', async ({ request }) => {
    // First get CSRF token
    const healthResponse = await request.get('/api/health');
    const cookies = healthResponse.headers()['set-cookie'] || '';
    const csrfMatch = cookies.match(/csrf_token=([^;]+)/);
    csrfToken = csrfMatch ? csrfMatch[1] : '';

    const response = await request.post('/api/register', {
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      data: {
        username: testUser,
        password: testPassword,
        email: testEmail,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
    authToken = body.token;
  });

  test('should login via API', async ({ request }) => {
    const healthResponse = await request.get('/api/health');
    const cookies = healthResponse.headers()['set-cookie'] || '';
    const csrfMatch = cookies.match(/csrf_token=([^;]+)/);
    csrfToken = csrfMatch ? csrfMatch[1] : '';

    const loginUser = `login_api_${Date.now()}`;

    // Register first
    await request.post('/api/register', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        username: loginUser,
        password: testPassword,
        email: `${loginUser}@test.com`,
      },
    });

    // Now login
    const response = await request.post('/api/login', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        username: loginUser,
        password: testPassword,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
  });

  test('should reject invalid credentials', async ({ request }) => {
    const healthResponse = await request.get('/api/health');
    const cookies = healthResponse.headers()['set-cookie'] || '';
    const csrfMatch = cookies.match(/csrf_token=([^;]+)/);
    csrfToken = csrfMatch ? csrfMatch[1] : '';

    const response = await request.post('/api/login', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        username: 'nonexistent',
        password: 'wrongpassword',
      },
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
  });
});

test.describe('API Characters', () => {
  let authToken: string;
  let csrfToken: string;
  let characterId: number;

  test.beforeAll(async ({ request }) => {
    // Get CSRF and register
    const healthResponse = await request.get('/api/health');
    const cookies = healthResponse.headers()['set-cookie'] || '';
    const csrfMatch = cookies.match(/csrf_token=([^;]+)/);
    csrfToken = csrfMatch ? csrfMatch[1] : '';

    const user = `char_api_${Date.now()}`;
    const regResponse = await request.post('/api/register', {
      headers: { 'X-CSRF-Token': csrfToken },
      data: {
        username: user,
        password: 'CharTest123',
        email: `${user}@test.com`,
      },
    });
    const regBody = await regResponse.json();
    authToken = regBody.token;
  });

  test('should create a character', async ({ request }) => {
    const response = await request.post('/api/characters', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-CSRF-Token': csrfToken,
      },
      data: {
        name: 'API Test Hero',
        data: { strength: 16, dexterity: 14 },
        system: 'aedelore',
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.id).toBeDefined();
    characterId = body.id;
  });

  test('should list characters', async ({ request }) => {
    const response = await request.get('/api/characters', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should get character by id', async ({ request }) => {
    // First create a character
    const createResponse = await request.post('/api/characters', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-CSRF-Token': csrfToken,
      },
      data: {
        name: 'Get Test Hero',
        data: { level: 1 },
        system: 'aedelore',
      },
    });
    const created = await createResponse.json();

    const response = await request.get(`/api/characters/${created.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.name).toBe('Get Test Hero');
  });

  test('should update character', async ({ request }) => {
    // Create first
    const createResponse = await request.post('/api/characters', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-CSRF-Token': csrfToken,
      },
      data: {
        name: 'Update Test Hero',
        data: { level: 1 },
        system: 'aedelore',
      },
    });
    const created = await createResponse.json();

    // Update
    const response = await request.put(`/api/characters/${created.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-CSRF-Token': csrfToken,
      },
      data: {
        name: 'Updated Hero',
        data: { level: 2 },
        system: 'aedelore',
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should delete character', async ({ request }) => {
    // Create first
    const createResponse = await request.post('/api/characters', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-CSRF-Token': csrfToken,
      },
      data: {
        name: 'Delete Test Hero',
        data: {},
        system: 'aedelore',
      },
    });
    const created = await createResponse.json();

    // Delete
    const response = await request.delete(`/api/characters/${created.id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-CSRF-Token': csrfToken,
      },
    });

    expect(response.ok()).toBeTruthy();
  });
});
