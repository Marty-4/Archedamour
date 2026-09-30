/**
 * Arche d'Amour - Token Validation API Route
 * POST /api/auth/validate-token
 * 
 * Validates a session token for WebSocket authentication
 * Used by the Reverb service to verify tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// Request body interface
interface ValidateTokenRequest {
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: ValidateTokenRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Corps de la requête invalide' },
        { status: 400 }
      );
    }

    const { token } = body;

    // Validate required fields
    if (typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Le token est requis' },
        { status: 400 }
      );
    }

    // Find session in database
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      logger.warn({ token: '[REDACTED]', event: 'token_validation_failed' }, 'Token de session invalide');
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Invalid token',
          message: 'Token de session invalide ou expiré' 
        },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      // Clean up expired session
      await db.session.delete({ where: { id: session.id } });
      logger.warn({ token: '[REDACTED]', event: 'token_validation_expired' }, 'Token de session expiré');
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Expired token',
          message: 'Token de session expiré' 
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (session.user.status !== 'ACTIVE') {
      logger.warn({ userId: session.user.id, event: 'token_validation_inactive' }, 'Utilisateur inactif');
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Inactive user',
          message: 'Ce compte est inactif' 
        },
        { status: 403 }
      );
    }

    // Check if user is locked out
    if (session.user.failedAttempts >= 5 && session.user.lockoutUntil && new Date() < session.user.lockoutUntil) {
      logger.warn({ userId: session.user.id, event: 'token_validation_locked' }, 'Compte verrouillé');
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Account locked',
          message: 'Ce compte est temporairement verrouillé' 
        },
        { status: 403 }
      );
    }

    // Token is valid
    logger.info({ userId: session.user.id, event: 'token_validation_success' }, 'Token validé avec succès');
    
    return NextResponse.json(
      {
        valid: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          avatar: session.user.avatar,
          role: session.user.role,
          status: session.user.status,
        },
        message: 'Token valide',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error, event: 'token_validation_error' }, 'Erreur lors de la validation du token');
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Internal Server Error', 
        message: 'Une erreur est survenue lors de la validation du token' 
      },
      { status: 500 }
    );
  }
}
