import crypto from 'crypto';

// Valid game systems
export const VALID_SYSTEMS = ['aedelore', 'dnd5e', 'pathfinder2e', 'storyteller', 'cod'] as const;
export type GameSystem = typeof VALID_SYSTEMS[number];

/**
 * Generate a secure random token for authentication
 * @returns 64-character hex string
 */
export function generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a secure random token for password reset
 * @returns 64-character hex string
 */
export function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate username format
 * @param username - Username to validate
 * @returns true if valid (3-30 chars, alphanumeric + underscore)
 */
export function validateUsername(username: string): boolean {
    return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns true if valid (8+ chars, contains letters and numbers)
 */
export function validatePassword(password: string): boolean {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid email format
 */
export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate game system
 * @param system - System to validate
 * @returns true if system is supported
 */
export function validateSystem(system: string): system is GameSystem {
    return VALID_SYSTEMS.includes(system as GameSystem);
}
