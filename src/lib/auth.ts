/**
 * Arche d'Amour Authentication Utilities
 * Helper functions for authentication, session management, and role checking
 * 
 * Note: This module uses Web Crypto API for compatibility with Edge Runtime.
 * All cryptographic operations are async.
 */

import { Role } from '@prisma/client';

// Session configuration - SEC-007: secure always true, SEC-008: sameSite strict
export const SESSION_CONFIG = {
  cookieName: 'archedamour_session',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  httpOnly: true,
  secure: true, // Always secure, even in development
  sameSite: 'strict' as const, // Changed from lax to strict for CSRF protection
  path: '/',
};

/**
 * Détermine si les cookies de session doivent porter le flag `Secure`.
 * Règle : uniquement si la requête arrive réellement en HTTPS (via
 * x-forwarded-proto derrière un proxy, ou protocole de l'URL en direct).
 *
 * Pourquoi pas « toujours true » : un navigateur JETTE un cookie `Secure`
 * reçu sur du HTTP simple → en dev LAN (http://192.168.x.x:3000 depuis un
 * téléphone), la session n'était jamais stockée et le middleware renvoyait
 * sans fin vers /login. Sur localhost et en production HTTPS, le flag reste
 * posé normalement.
 */
export function shouldUseSecureCookies(request: Request): boolean {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto.split(',')[0].trim() === 'https';
  }
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return false;
  }
}

// User interface for session (without password)
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: Role;
  status: string;
}

// Session data structure
export interface SessionData {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

// Hash prefix for identifying algorithm
const PBKDF2_PREFIX = 'pbkdf2';

// Helper: Convert hex string to Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Helper: Convert Uint8Array to hex string
function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Generate random bytes (replaces node:crypto.randomBytes)
function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

// Helper: PBKDF2 using Web Crypto API (replaces node:crypto.pbkdf2Sync)
async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
  keyLength: number,
  digest: string
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const hashAlgorithm = digest === 'sha256' ? 'SHA-256' : digest === 'sha512' ? 'SHA-512' : 'SHA-1';

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: iterations,
      hash: hashAlgorithm,
    },
    keyMaterial,
    keyLength * 8
  );

  return new Uint8Array(derivedBits);
}

// Helper: Timing-safe comparison (replaces node:crypto.timingSafeEqual)
// Note: Web Crypto API does not have a standard timingSafeEqual method.
// This implementation uses a constant-time comparison algorithm.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Hash a password using PBKDF2 with Web Crypto API
 * - Uses 310,000 iterations for SHA-256
 * - Generates a 16-byte salt
 * - Produces a 32-byte derived key
 */
export async function hashPassword(password: string): Promise<string> {
  const iterations = 310_000;
  const salt = generateRandomBytes(16);
  const derivedKey = await pbkdf2(password, salt, iterations, 32, 'sha256');
  return `${PBKDF2_PREFIX}$sha256$${iterations}$${uint8ArrayToHex(salt)}$${uint8ArrayToHex(derivedKey)}`;
}

/**
 * Verify password against stored hash
 * Supports PBKDF2 hashes for backward compatibility
 * - Uses Web Crypto API for timing-safe comparison
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Determine algorithm from prefix
  if (hashedPassword.startsWith(`${PBKDF2_PREFIX}$`)) {
    // PBKDF2 hash (backward compatibility)
    const parts = hashedPassword.split('$');
    
    // Expected format: pbkdf2$sha256$iterations$salt_hex$key_hex
    if (parts.length !== 5) {
      return false;
    }

    const [, digest, iterationValue, saltValue, keyValue] = parts;

    if (digest !== 'sha256' || !iterationValue || !saltValue || !keyValue) {
      return false;
    }

    const iterations = Number(iterationValue);
    if (!Number.isSafeInteger(iterations) || iterations < 1) return false;

    try {
      const expectedKey = hexToUint8Array(keyValue);
      const salt = hexToUint8Array(saltValue);
      const derivedKey = await pbkdf2(password, salt, iterations, expectedKey.length, digest);
      
      if (expectedKey.length !== derivedKey.length) {
        return false;
      }
      
      return timingSafeEqual(expectedKey, derivedKey);
    } catch {
      return false;
    }
  }
  
  // Unknown format - try to handle legacy Argon2 hashes
  // Since Argon2 is not available in Edge Runtime, we return false
  // Users with Argon2 hashes will need to reset their password
  console.warn('Unsupported hash format - password reset required');
  return false;
}

/**
 * Synchronous version of verifyPassword - DEPRECATED
 * This function is not available in Edge Runtime and should not be used.
 * Use verifyPassword() instead.
 * @deprecated Use verifyPassword() instead
 */
export function verifyPasswordSync(password: string, hashedPassword: string): boolean {
  throw new Error(
    'verifyPasswordSync is not supported in Edge Runtime. Use verifyPassword() instead.'
  );
}

/**
 * Generate a random session token
 */
export function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (let i = 0; i < 32; i++) {
    token += chars[array[i] % chars.length];
  }
  return `cc_${token}_${Date.now().toString(36)}`;
}

/**
 * Check if a user has required role or higher
 * Roles hierarchy: SUPER_ADMIN > PASTOR > ADMIN > TREASURER > DEPARTMENT_HEAD > MODERATOR > MEMBER
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 7,
  PASTOR: 6,
  ADMIN: 5,
  TREASURER: 4,
  DEPARTMENT_HEAD: 3,
  MODERATOR: 2,
  MEMBER: 1,
};

export function hasRequiredRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user is at least an admin
 */
export function isAdmin(userRole: Role): boolean {
  return hasRequiredRole(userRole, 'ADMIN');
}

/**
 * Check if user is at least a pastor
 */
export function isPastor(userRole: Role): boolean {
  return hasRequiredRole(userRole, 'PASTOR');
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userRole: Role): boolean {
  return userRole === 'SUPER_ADMIN';
}

/**
 * Get role display name in French
 */
export function getRoleDisplayName(role: Role): string {
  const names: Record<Role, string> = {
    SUPER_ADMIN: 'Super Administrateur',
    PASTOR: 'Pasteur',
    ADMIN: 'Administrateur',
    TREASURER: 'Trésorier',
    DEPARTMENT_HEAD: 'Chef de Département',
    MODERATOR: 'Modérateur',
    MEMBER: 'Membre',
  };
  return names[role];
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Minimum 8 characters, at least one letter and one number
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format phone number to standard format
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add country code if missing (assuming France/CI)
  if (digits.length === 10 && !phone.startsWith('+')) {
    return `+225${digits}`;
  }
  
  if (digits.length > 10 && !phone.startsWith('+')) {
    return `+${digits}`;
  }
  
  return phone.startsWith('+') ? phone : `+${digits}`;
}
