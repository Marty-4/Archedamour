/**
 * Arche d'Amour - Reset Password API Route
 * POST /api/auth/reset-password
 * 
 * Handles password reset with a valid reset token
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, isValidEmail, validatePasswordStrength } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimiter } from '@/lib/rate-limit';

// Request body interface
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - SEC-005
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const { success } = await rateLimiter.limit(ip);
    
    if (!success) {
      logger.warn({ ip, event: 'rate_limit_exceeded' }, 'Trop de tentatives de réinitialisation');
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { status: 429 }
      );
    }

    // Parse request body
    let body: ResetPasswordRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Corps de la requête invalide' },
        { status: 400 }
      );
    }

    const { token, newPassword, confirmNewPassword } = body;

    // Validate required fields
    if (typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Le token est requis' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || !newPassword) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Le nouveau mot de passe est requis' },
        { status: 400 }
      );
    }

    if (typeof confirmNewPassword !== 'string' || !confirmNewPassword) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'La confirmation du nouveau mot de passe est requise' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Validation Error', message: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Les nouveaux mots de passe ne correspondent pas' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gt: new Date() }, // Token not expired
      },
    });

    if (!user) {
      logger.warn({ ip, token: '[REDACTED]', event: 'reset_password_invalid_token' }, 'Token de réinitialisation invalide ou expiré');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Token de réinitialisation invalide ou expiré' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      logger.warn({ ip, userId: user.id, event: 'reset_password_inactive' }, 'Tentative de réinitialisation pour un compte inactif');
      return NextResponse.json(
        { error: 'Forbidden', message: 'Ce compte est inactif' },
        { status: 403 }
      );
    }

    // Hash new password - SEC-012: Uses Argon2
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
        failedAttempts: 0, // Reset failed attempts on password change
        lockoutUntil: null,
        updatedAt: new Date(),
      },
    });

    // Log successful password reset
    logger.info({ 
      ip, 
      userId: user.id, 
      event: 'reset_password_success'
    }, 'Réinitialisation du mot de passe réussie');

    return NextResponse.json(
      {
        success: true,
        message: 'Votre mot de passe a été réinitialisé avec succès.',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error, event: 'reset_password_error' }, 'Erreur lors de la réinitialisation du mot de passe');
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Une erreur est survenue lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}
