const request = require('supertest');
const { app, db } = require('../server');

describe('Auth Endpoints', () => {
    let testToken;
    let testUserId;
    const testUser = {
        username: 'jesttest_' + Date.now(),
        password: 'testpass123',
        email: `jesttest_${Date.now()}@test.com`
    };

    // Clean up test user after all tests
    afterAll(async () => {
        if (testUserId) {
            try {
                await db.query('DELETE FROM auth_tokens WHERE user_id = $1', [testUserId]);
                await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        await db.pool.end();
    });

    describe('POST /api/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/register')
                .send(testUser);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.userId).toBeDefined();

            testToken = res.body.token;
            testUserId = res.body.userId;
        });

        it('should reject duplicate username', async () => {
            const res = await request(app)
                .post('/api/register')
                .send(testUser);

            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should reject invalid username (too short)', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    username: 'ab',
                    password: 'testpass123',
                    email: 'short@test.com'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Username');
        });

        it('should reject weak password', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    username: 'weakpass_' + Date.now(),
                    password: 'short',
                    email: 'weak@test.com'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Password');
        });

        it('should reject invalid email', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    username: 'bademail_' + Date.now(),
                    password: 'testpass123',
                    email: 'notanemail'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('email');
        });

        it('should reject missing fields', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    username: 'missing_' + Date.now()
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });
    });

    describe('POST /api/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    username: testUser.username,
                    password: testUser.password
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();

            // Update token for later tests
            testToken = res.body.token;
        });

        it('should reject invalid password', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    username: testUser.username,
                    password: 'wrongpassword123'
                });

            expect(res.status).toBe(401);
            expect(res.body.error).toContain('Invalid');
        });

        it('should reject non-existent user', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    username: 'nonexistent_user_12345',
                    password: 'testpass123'
                });

            expect(res.status).toBe(401);
            expect(res.body.error).toContain('Invalid');
        });

        it('should reject missing credentials', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });
    });

    describe('GET /api/me', () => {
        it('should return user profile with valid token', async () => {
            const res = await request(app)
                .get('/api/me')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(200);
            expect(res.body.username).toBe(testUser.username);
            expect(res.body.email).toBe(testUser.email.toLowerCase());
            expect(res.body.stats).toBeDefined();
        });

        it('should reject invalid token', async () => {
            const res = await request(app)
                .get('/api/me')
                .set('Authorization', 'Bearer invalidtoken123');

            expect(res.status).toBe(401);
        });

        it('should reject missing token', async () => {
            const res = await request(app)
                .get('/api/me');

            expect(res.status).toBe(401);
        });
    });

    describe('PUT /api/account/password', () => {
        it('should change password with valid current password', async () => {
            const res = await request(app)
                .put('/api/account/password')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    currentPassword: testUser.password,
                    newPassword: 'newpassword123'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Change back for other tests
            await request(app)
                .put('/api/account/password')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    currentPassword: 'newpassword123',
                    newPassword: testUser.password
                });
        });

        it('should reject wrong current password', async () => {
            const res = await request(app)
                .put('/api/account/password')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword123'
                });

            expect(res.status).toBe(401);
        });

        it('should reject weak new password', async () => {
            const res = await request(app)
                .put('/api/account/password')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    currentPassword: testUser.password,
                    newPassword: 'weak'
                });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/logout', () => {
        it('should logout successfully', async () => {
            // Get a fresh token for this test
            const loginRes = await request(app)
                .post('/api/login')
                .send({
                    username: testUser.username,
                    password: testUser.password
                });

            // Verify login succeeded first
            expect(loginRes.status).toBe(200);
            expect(loginRes.body.token).toBeDefined();

            const logoutToken = loginRes.body.token;

            const res = await request(app)
                .post('/api/logout')
                .set('Authorization', `Bearer ${logoutToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify token is invalidated
            const meRes = await request(app)
                .get('/api/me')
                .set('Authorization', `Bearer ${logoutToken}`);

            expect(meRes.status).toBe(401);
        });
    });
});

describe('Health Check', () => {
    it('GET /api/health should return ok', async () => {
        const res = await request(app).get('/api/health');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.database).toBe('postgresql');
    });
});
