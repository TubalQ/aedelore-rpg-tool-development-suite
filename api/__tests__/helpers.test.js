const {
    generateToken,
    generateResetToken,
    validateUsername,
    validatePassword,
    validateEmail,
    validateSystem,
    VALID_SYSTEMS
} = require('../helpers');

describe('Helper Functions', () => {
    describe('generateToken', () => {
        it('should generate a 64-character hex token', () => {
            const token = generateToken();
            expect(token).toHaveLength(64);
            expect(/^[a-f0-9]+$/.test(token)).toBe(true);
        });

        it('should generate unique tokens', () => {
            const token1 = generateToken();
            const token2 = generateToken();
            expect(token1).not.toBe(token2);
        });
    });

    describe('generateResetToken', () => {
        it('should generate a 64-character hex token', () => {
            const token = generateResetToken();
            expect(token).toHaveLength(64);
            expect(/^[a-f0-9]+$/.test(token)).toBe(true);
        });
    });

    describe('validateUsername', () => {
        it('should accept valid usernames', () => {
            expect(validateUsername('abc')).toBe(true);
            expect(validateUsername('user123')).toBe(true);
            expect(validateUsername('Test_User')).toBe(true);
            expect(validateUsername('a'.repeat(30))).toBe(true);
        });

        it('should reject too short usernames', () => {
            expect(validateUsername('ab')).toBe(false);
            expect(validateUsername('a')).toBe(false);
            expect(validateUsername('')).toBe(false);
        });

        it('should reject too long usernames', () => {
            expect(validateUsername('a'.repeat(31))).toBe(false);
        });

        it('should reject usernames with invalid characters', () => {
            expect(validateUsername('user name')).toBe(false);
            expect(validateUsername('user@name')).toBe(false);
            expect(validateUsername('user-name')).toBe(false);
            expect(validateUsername('user.name')).toBe(false);
            expect(validateUsername('user!name')).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should accept valid passwords', () => {
            expect(validatePassword('password1')).toBe(true);
            expect(validatePassword('12345678a')).toBe(true);
            expect(validatePassword('MyP4ssw0rd!')).toBe(true);
            expect(validatePassword('abcdefg1')).toBe(true);
        });

        it('should reject too short passwords', () => {
            expect(validatePassword('pass1')).toBe(false);
            expect(validatePassword('1234567')).toBe(false);
            expect(validatePassword('')).toBe(false);
        });

        it('should reject passwords without letters', () => {
            expect(validatePassword('12345678')).toBe(false);
            expect(validatePassword('!@#$%^&*1')).toBe(false);
        });

        it('should reject passwords without numbers', () => {
            expect(validatePassword('password')).toBe(false);
            expect(validatePassword('abcdefgh')).toBe(false);
        });
    });

    describe('validateEmail', () => {
        it('should accept valid emails', () => {
            expect(validateEmail('user@example.com')).toBe(true);
            expect(validateEmail('test.user@domain.org')).toBe(true);
            expect(validateEmail('a@b.co')).toBe(true);
            expect(validateEmail('user+tag@example.com')).toBe(true);
        });

        it('should reject invalid emails', () => {
            expect(validateEmail('notanemail')).toBe(false);
            expect(validateEmail('user@')).toBe(false);
            expect(validateEmail('@domain.com')).toBe(false);
            expect(validateEmail('user@domain')).toBe(false);
            expect(validateEmail('')).toBe(false);
            expect(validateEmail('user @domain.com')).toBe(false);
        });
    });

    describe('validateSystem', () => {
        it('should accept valid systems', () => {
            expect(validateSystem('aedelore')).toBe(true);
            expect(validateSystem('dnd5e')).toBe(true);
            expect(validateSystem('pathfinder2e')).toBe(true);
            expect(validateSystem('storyteller')).toBe(true);
            expect(validateSystem('cod')).toBe(true);
        });

        it('should reject invalid systems', () => {
            expect(validateSystem('invalid')).toBe(false);
            expect(validateSystem('')).toBe(false);
            expect(validateSystem('dnd4e')).toBe(false);
        });

        it('should have correct VALID_SYSTEMS constant', () => {
            expect(VALID_SYSTEMS).toContain('aedelore');
            expect(VALID_SYSTEMS).toContain('dnd5e');
            expect(VALID_SYSTEMS).toContain('pathfinder2e');
            expect(VALID_SYSTEMS).toContain('storyteller');
            expect(VALID_SYSTEMS).toContain('cod');
            expect(VALID_SYSTEMS.length).toBe(5);
        });
    });
});
