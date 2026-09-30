/**
 * Arche d'Amour - Refresh Token API Route
 * POST /api/auth/refresh
 * 
 * Handles session token refresh using a valid refresh token
 * - SEC-011: Implements refresh token system
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken, SESSION_CONFIG, shouldUseSecureCookies, type AuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimiter } from '@/lib/rate-limit';

// Refresh token configuration
const REFRESH_TOKEN_CONFIG = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  cookieName: 'archedamour_refresh',
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - SEC-005
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const { success } = await rateLimiter.limit(ip);
    
    if (!success) {
      logger.warn({ ip, event: 'rate_limit_exceeded' }, 'Trop de tentatives de rafraîchissement');
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { status: 429 }
      );
    }

    // Get session token and refresh token from cookies
    const sessionToken = request.cookies.get(SESSION_CONFIG.cookieName)?.value;
    const refreshToken = request.cookies.get(REFRESH_TOKEN_CONFIG.cookieName)?.value;

    // Both tokens are required
    if (!sessionToken || !refreshToken) {
      logger.warn({ ip, event: 'refresh_missing_tokens' }, 'Token de session ou de rafraîchissement manquant');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Token manquant' },
        { status: 401 }
      );
    }

    // Find session in database
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session) {
      logger.warn({ ip, token: '[REDACTED]', event: 'refresh_invalid_session' }, 'Session invalide');
      // Clear both cookies
      const response = NextResponse.json(
        { error: 'Unauthorized', message: 'Session invalide' },
        { status: 401 }
      );
      
      response.cookies.delete(SESSION_CONFIG.cookieName);
      response.cookies.delete(REFRESH_TOKEN_CONFIG.cookieName);
      
      return response;
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      logger.warn({ ip, userId: session.user.id, event: 'refresh_session_expired' }, 'Session expirée');
      // Delete expired session
      await db.session.delete({ where: { id: session.id } });
      
      const response = NextResponse.json(
        { error: 'Unauthorized', message: 'Session expirée' },
        { status: 401 }
      );
      
      response.cookies.delete(SESSION_CONFIG.cookieName);
      response.cookies.delete(REFRESH_TOKEN_CONFIG.cookieName);
      
      return response;
    }

    // Check if user is active
    if (session.user.status !== 'ACTIVE') {
      logger.warn({ ip, userId: session.user.id, event: 'refresh_user_inactive' }, 'Utilisateur inactif');
      return NextResponse.json(
        { error: 'Forbidden', message: 'Ce compte est inactif' },
        { status: 403 }
      );
    }

    // Check if user is locked out
    if (session.user.failedAttempts >= 5 && session.user.lockoutUntil && new Date() < session.user.lockoutUntil) {
      logger.warn({ ip, userId: session.user.id, event: 'refresh_user_locked' }, 'Compte verrouillé');
      return NextResponse.json(
        { error: 'Forbidden', message: 'Ce compte est temporairement verrouillé' },
        { status: 403 }
      );
    }

    // Verify refresh token (stored in user table)
    if (session.user.refreshToken !== refreshToken) {
      logger.warn({ ip, userId: session.user.id, event: 'refresh_invalid_refresh_token' }, 'Token de rafraîchissement invalide');
      // Clear both cookies
      const response = NextResponse.json(
        { error: 'Unauthorized', message: 'Token de rafraîchissement invalide' },
        { status: 401 }
      );
      
      response.cookies.delete(SESSION_CONFIG.cookieName);
      response.cookies.delete(REFRESH_TOKEN_CONFIG.cookieName);
      
      return response;
    }

    // Check if refresh token is expired
    if (session.user.refreshTokenExpiresAt && new Date() > session.user.refreshTokenExpiresAt) {
      logger.warn({ ip, userId: session.user.id, event: 'refresh_refresh_token_expired' }, 'Token de rafraîchissement expiré');
      // Clear both cookies
      const response = NextResponse.json(
        { error: 'Unauthorized', message: 'Token de rafraîchissement expiré' },
        { status: 401 }
      );
      
      response.cookies.delete(SESSION_CONFIG.cookieName);
      response.cookies.delete(REFRESH_TOKEN_CONFIG.cookieName);
      
      return response;
    }

    // Generate new session token
    const newSessionToken = generateToken();
    const newSessionExpiresAt = Date.now() + SESSION_CONFIG.maxAge * 1000;

    // Delete old session
    await db.session.delete({ where: { id: session.id } });

    // Create new session
    await db.session.create({
      data: {
        token: newSessionToken,
        userId: session.user.id,
        expiresAt: new Date(newSessionExpiresAt),
      },
    });

    // Generate new refresh token
    const newRefreshToken = generateToken();
    const newRefreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_CONFIG.maxAge * 1000);

    // Update user with new refresh token
    await db.user.update({
      where: { id: session.user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: newRefreshTokenExpiresAt,
      },
    });

    // Build auth user object
    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatar: session.user.avatar,
      role: session.user.role,
      status: session.user.status,
    };

    // Create response with new tokens
    const response = NextResponse.json(
      {
        success: true,
        user,
        message: 'Session rafraîchie avec succès',
      },
      { status: 200 }
    );

    // Set new session cookie - SEC-008: sameSite strict
    // `Secure` conditionné au HTTPS réel (voir shouldUseSecureCookies).
    const useSecure = shouldUseSecureCookies(request);
    response.cookies.set(SESSION_CONFIG.cookieName, newSessionToken, {
      httpOnly: SESSION_CONFIG.httpOnly,
      secure: useSecure,
      sameSite: 'strict',
      path: SESSION_CONFIG.path,
      maxAge: SESSION_CONFIG.maxAge,
    });

    // Set new refresh cookie
    response.cookies.set(REFRESH_TOKEN_CONFIG.cookieName, newRefreshToken, {
      httpOnly: true,
      secure: useSecure,
      sameSite: 'strict',
      path: '/',
      maxAge: REFRESH_TOKEN_CONFIG.maxAge,
    });

    logger.info({ ip, userId: user.id, event: 'refresh_success' }, 'Session rafraîchie avec succès');

    return response;
  } catch (error) {
    logger.error({ error, event: 'refresh_error' }, 'Erreur lors du rafraîchissement de la session');
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Une erreur est survenue lors du rafraîchissement de la session' },
      { status: 500 }
    );
  }
}
