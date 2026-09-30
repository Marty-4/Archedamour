/**
 * Arche d'Amour - Logout API Route
 * POST /api/auth/logout
 * 
 * Handles user logout and session cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SESSION_CONFIG, shouldUseSecureCookies } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Get session token from cookie
    const token = request.cookies.get(SESSION_CONFIG.cookieName)?.value;

    // If token exists, delete session from database
    if (token) {
      try {
        const deletedSessions = await db.session.deleteMany({
          where: { token },
        });
        logger.info({ ip, userAgent, deletedCount: deletedSessions.count, event: 'logout_session_deleted' }, 'Sessions supprimées de la base');
      } catch (error) {
        logger.error({ error, ip, event: 'logout_session_delete_error' }, 'Échec de la suppression de la session');
        // Continue with logout even if database deletion fails
      }
    }

    // Create response that clears the session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Déconnexion réussie',
      },
      { status: 200 }
    );

    // Clear the session cookie by setting expired date - SEC-008: sameSite strict
    response.cookies.set(SESSION_CONFIG.cookieName, '', {
      httpOnly: SESSION_CONFIG.httpOnly,
      secure: shouldUseSecureCookies(request),
      sameSite: 'strict', // CSRF protection
      path: SESSION_CONFIG.path,
      maxAge: 0, // Immediately expire the cookie
    });

    logger.info({ ip, userAgent, event: 'logout_success' }, 'Déconnexion réussie');

    return response;
  } catch (error) {
    logger.error({ error, event: 'logout_error' }, 'Erreur lors de la déconnexion');
    
    // Even if there's an error, try to clear the cookie and return success
    const response = NextResponse.json(
      {
        success: true,
        message: 'Déconnexion réussie',
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
}

