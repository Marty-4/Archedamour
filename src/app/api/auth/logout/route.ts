/**
 * ChurchConnect - Logout API Route
 * POST /api/auth/logout
 * 
 * Handles user logout and session cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SESSION_CONFIG } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const token = request.cookies.get(SESSION_CONFIG.cookieName)?.value;

    // If token exists, delete session from database
    if (token) {
      try {
        await db.session.deleteMany({
          where: { token },
        });
      } catch (error) {
        console.error('Failed to delete session:', error);
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

    // Clear the session cookie by setting expired date
    response.cookies.set(SESSION_CONFIG.cookieName, '', {
      httpOnly: SESSION_CONFIG.httpOnly,
      secure: SESSION_CONFIG.secure,
      sameSite: SESSION_CONFIG.sameSite,
      path: SESSION_CONFIG.path,
      maxAge: 0, // Immediately expire the cookie
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
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
      secure: SESSION_CONFIG.secure,
      sameSite: SESSION_CONFIG.sameSite,
      path: SESSION_CONFIG.path,
      maxAge: 0,
    });

    return response;
  }
}
