/**
 * Arche d'Amour - Forgot Password API Route
 * POST /api/auth/forgot-password
 * 
 * Handles password reset requests
 * Generates a reset token and sends it to the user's email
 * For now, just generates the token (email sending to be implemented)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken, isValidEmail } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimiter } from '@/lib/rate-limit';

// Request body interface
interface ForgotPasswordRequest {
  email: string;
}

// Reset token expiration: 1 hour
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

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
    let body: ForgotPasswordRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Corps de la requête invalide' },
        { status: 400 }
      );
    }

    const { email } = body;

    // Validate required fields
    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'L\'email est requis' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Veuillez entrer une adresse email valide' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user in database
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Don't reveal if email exists or not (security best practice)
    // Always return success to prevent email enumeration
    if (!user) {
      logger.warn({ ip, email: normalizedEmail, event: 'forgot_password_no_user' }, 'Tentative de réinitialisation pour un email inexistant');
      // Return success but don't send email
      return NextResponse.json(
        { 
          success: true, 
          message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' 
        },
        { status: 200 }
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      logger.warn({ ip, userId: user.id, event: 'forgot_password_inactive' }, 'Tentative de réinitialisation pour un compte inactif');
      return NextResponse.json(
        { 
          success: true, 
          message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' 
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    // Store reset token in database
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt,
        updatedAt: new Date(),
      },
    });

    // Log the reset request
    logger.info({ 
      ip, 
      userId: user.id, 
      email: normalizedEmail,
      event: 'forgot_password_request'
    }, 'Demande de réinitialisation de mot de passe');

    // TODO: Send email with reset link
    // const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    // await sendEmail(user.email, 'Réinitialisation de mot de passe', `Cliquez ici: ${resetLink}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
        // In development, return the token for testing (remove in production)
        ...(process.env.NODE_ENV === 'development' ? { resetToken } : {}),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error, event: 'forgot_password_error' }, 'Erreur lors de la demande de réinitialisation');
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Une erreur est survenue lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}
