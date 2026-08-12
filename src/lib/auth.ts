/**
 * Arche d'Amour Authentication Utilities
 * Helper functions for authentication, session management, and role checking
 */

import { Role } from '@prisma/client';

// Session configuration
export const SESSION_CONFIG = {
  cookieName: 'archedamour_session',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

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

/**
 * Generate a simple hash for password (demo purposes)
 * In production, use bcrypt or argon2
 */
export function hashPassword(password: string): string {
  // Simple hash for demo - NOT secure for production!
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash).toString(36)}_${btoa(password).slice(0, 20)}`;
}

/**
 * Verify password against stored hash (demo)
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
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
