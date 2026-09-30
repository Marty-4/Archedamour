/**
 * Arche d'Amour - Get Current User API Route
 * GET /api/auth/me
 * 
 * Returns the currently authenticated user based on session token
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SESSION_CONFIG, shouldUseSecureCookies, type AuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Get session token from cookie
    const token = request.cookies.get(SESSION_CONFIG.cookieName)?.value;

    // No token means not authenticated
    if (!token) {
      logger.info({ ip, event: 'me_not_authenticated' }, 'Utilisateur non authentifié');
      return NextResponse.json(
        {
          user: null,
          authenticated: false,
          message: 'Non authentifié',
        },
        { status: 200 }
      );
    }

    // Find session in database
    const session = await db.session.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });

    // No session found or expired
    if (!session) {
      logger.warn({ ip, token: '[REDACTED]', event: 'me_invalid_session' }, 'Session invalide ou expirée');
      // Clear invalid cookie - SEC-007: secure always true, SEC-008: sameSite strict
      const response = NextResponse.json(
        {
          user: null,
          authenticated: false,
          message: 'Session invalide ou expirée',
        },
        { status: 200 }
      );

      response.cookies.set(SESSION_CONFIG.cookieName, '', {
        httpOnly: SESSION_CONFIG.httpOnly,
        secure: shouldUseSecureCookies(request),
        sameSite: 'strict',
        path: SESSION_CONFIG.path,
        maxAge: 0,
      });

      return response;
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      logger.info({ ip, userId: session.user.id, event: 'me_session_expired' }, 'Session expirée');
      // Delete expired session
      try {
        await db.session.delete({
          where: { id: session.id },
        });
      } catch (error) {
        logger.error({ error, ip, event: 'me_delete_expired_session_error' }, 'Échec de la suppression de la session expirée');
      }

      // Clear cookie for expired session
      const response = NextResponse.json(
        {
          user: null,
          authenticated: false,
          message: 'Session expirée',
        },
        { status: 200 }
      );

      response.cookies.set(SESSION_CONFIG.cookieName, '', {
        httpOnly: SESSION_CONFIG.httpOnly,
        secure: shouldUseSecureCookies(request),
        sameSite: 'strict',
        path: SESSION_CONFIG.path,
        maxAge: 0,
      });

      return response;
    }

    // Check user status
    if (session.user.status === 'SUSPENDED') {
      logger.warn({ ip, userId: session.user.id, event: 'me_user_suspended' }, 'Compte suspendu');
      return NextResponse.json(
        {
          user: null,
          authenticated: false,
          message: 'Ce compte a été suspendu',
        },
        { status: 403 }
      );
    }

    if (session.user.status === 'INACTIVE') {
      logger.warn({ ip, userId: session.user.id, event: 'me_user_inactive' }, 'Compte inactif');
      return NextResponse.json(
        {
          user: null,
          authenticated: false,
          message: 'Ce compte est inactif',
        },
        { status: 403 }
      );
    }

    // Check if user is locked out
    if (session.user.failedAttempts >= 5 && session.user.lockoutUntil && new Date() < session.user.lockoutUntil) {
      logger.warn({ ip, userId: session.user.id, event: 'me_user_locked' }, 'Compte verrouillé');
      return NextResponse.json(
        {
          user: null,
          authenticated: false,
          message: 'Ce compte est temporairement verrouillé',
        },
        { status: 403 }
      );
    }

    // Return user data without password
    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatar: session.user.avatar,
      role: session.user.role,
      status: session.user.status,
    };

    logger.info({ ip, userId: user.id, event: 'me_authenticated' }, 'Utilisateur authentifié');

    return NextResponse.json(
      {
        user,
        authenticated: true,
        message: 'Utilisateur authentifié',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ error, event: 'me_error' }, 'Erreur lors de la vérification de l\'authentification');
    
    return NextResponse.json(
      {
        user: null,
        authenticated: false,
        message: 'Erreur lors de la vérification de l\'authentification',
      },
      { status: 500 }
    );
  }
}

