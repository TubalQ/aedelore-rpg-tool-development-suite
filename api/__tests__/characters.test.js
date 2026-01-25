const request = require('supertest');
const { app, db } = require('../server');

describe('Character Endpoints', () => {
    let testToken;
    let testUserId;
    let testCharacterId;
    const timestamp = Date.now();
    const testUser = {
        username: 'chartest_' + timestamp,
        password: 'testpass123',
        email: `chartest_${timestamp}@test.com`
    };

    // Setup: Create test user
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/register')
            .send(testUser);

        testToken = res.body.token;
        testUserId = res.body.userId;
    });

    // Cleanup: Delete test user and their data
    afterAll(async () => {
        if (testUserId) {
            try {
                await db.query('DELETE FROM characters WHERE user_id = $1', [testUserId]);
                await db.query('DELETE FROM auth_tokens WHERE user_id = $1', [testUserId]);
                await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
        await db.pool.end();
    });

    describe('GET /api/characters', () => {
        it('should return empty array for new user', async () => {
            const res = await request(app)
                .get('/api/characters')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });

        it('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/characters');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/characters', () => {
        it('should create a new character', async () => {
            const res = await request(app)
                .post('/api/characters')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    name: 'Test Character',
                    data: { race: 'Human', class: 'Warrior', attributes: { strength: 10 } },
                    system: 'aedelore'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.id).toBeDefined();

            testCharacterId = res.body.id;
        });

        it('should reject character without name', async () => {
            const res = await request(app)
                .post('/api/characters')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    data: { race: 'Human' },
                    system: 'aedelore'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Name');
        });

        it('should reject character without data', async () => {
            const res = await request(app)
                .post('/api/characters')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    name: 'No Data Character'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('data');
        });

        it('should reject name that is too long', async () => {
            const res = await request(app)
                .post('/api/characters')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    name: 'A'.repeat(101),
                    data: { race: 'Human' },
                    system: 'aedelore'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('100');
        });

        it('should default to aedelore system for invalid system', async () => {
            const res = await request(app)
                .post('/api/characters')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    name: 'Invalid System Char',
                    data: { race: 'Human' },
                    system: 'invalid_system'
                });

            expect(res.status).toBe(200);
            // The character is created with 'aedelore' system by default
        });
    });

    describe('GET /api/characters/:id', () => {
        it('should return character by id', async () => {
            const res = await request(app)
                .get(`/api/characters/${testCharacterId}`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(testCharacterId);
            expect(res.body.name).toBe('Test Character');
            expect(res.body.system).toBe('aedelore');
        });

        it('should return 404 for non-existent character', async () => {
            const res = await request(app)
                .get('/api/characters/999999')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(404);
        });

        it('should not return another user\'s character', async () => {
            // Create another user
            const otherUser = {
                username: 'other_' + timestamp,
                password: 'testpass123',
                email: `other_${timestamp}@test.com`
            };
            const otherRes = await request(app)
                .post('/api/register')
                .send(otherUser);

            const otherToken = otherRes.body.token;
            const otherUserId = otherRes.body.userId;

            // Try to access first user's character
            const res = await request(app)
                .get(`/api/characters/${testCharacterId}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.status).toBe(404);

            // Cleanup other user
            await db.query('DELETE FROM auth_tokens WHERE user_id = $1', [otherUserId]);
            await db.query('DELETE FROM users WHERE id = $1', [otherUserId]);
        });
    });

    describe('PUT /api/characters/:id', () => {
        it('should update character', async () => {
            const res = await request(app)
                .put(`/api/characters/${testCharacterId}`)
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    name: 'Updated Character',
                    data: { race: 'Elf', class: 'Mage', level: 5 },
                    system: 'aedelore'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify update
            const getRes = await request(app)
                .get(`/api/characters/${testCharacterId}`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(getRes.body.name).toBe('Updated Character');
        });

        it('should return 404 for non-existent character', async () => {
            const res = await request(app)
                .put('/api/characters/999999')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    name: 'Ghost Character',
                    data: { race: 'Ghost' },
                    system: 'aedelore'
                });

            expect(res.status).toBe(404);
        });
    });

    describe('Character Locking', () => {
        it('should lock race/class', async () => {
            const res = await request(app)
                .post(`/api/characters/${testCharacterId}/lock-race-class`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should reject double-locking race/class', async () => {
            const res = await request(app)
                .post(`/api/characters/${testCharacterId}/lock-race-class`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('already locked');
        });

        it('should lock attributes after race/class', async () => {
            const res = await request(app)
                .post(`/api/characters/${testCharacterId}/lock-attributes`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should lock abilities after attributes', async () => {
            const res = await request(app)
                .post(`/api/characters/${testCharacterId}/lock-abilities`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('DELETE /api/characters/:id', () => {
        it('should soft delete character', async () => {
            const res = await request(app)
                .delete(`/api/characters/${testCharacterId}`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify character is no longer accessible
            const getRes = await request(app)
                .get(`/api/characters/${testCharacterId}`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(getRes.status).toBe(404);
        });

        it('should return 404 for already deleted character', async () => {
            const res = await request(app)
                .delete(`/api/characters/${testCharacterId}`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(404);
        });
    });
});
