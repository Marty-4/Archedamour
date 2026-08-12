/**
 * ChurchConnect - Get Current User API Route
 * GET /api/auth/me
 * 
 * Returns the currently authenticated user based on session token
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SESSION_CONFIG, type AuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const token = request.cookies.get(SESSION_CONFIG.cookieName)?.value;

    // No token means not authenticated
    if (!token) {
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
      // Clear invalid cookie
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
        secure: SESSION_CONFIG.secure,
        sameSite: SESSION_CONFIG.sameSite,
        path: SESSION_CONFIG.path,
        maxAge: 0,
      });

      return response;
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      // Delete expired session
      try {
        await db.session.delete({
          where: { id: session.id },
        });
      } catch (error) {
        console.error('Failed to delete expired session:', error);
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
        secure: SESSION_CONFIG.secure,
        sameSite: SESSION_CONFIG.sameSite,
        path: SESSION_CONFIG.path,
        maxAge: 0,
      });

      return response;
    }

    // Check user status
    if (session.user.status === 'SUSPENDED') {
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
      return NextResponse.json(
        {
          user: null,
          authenticated: false,
          message: 'Ce compte est inactif',
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

    return NextResponse.json(
      {
        user,
        authenticated: true,
        message: 'Utilisateur authentifié',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current user error:', error);
    
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
