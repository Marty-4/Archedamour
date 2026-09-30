/**
 * Arche d'Amour - Login API Route
 * POST /api/auth/login
 * 
 * Handles user authentication and session creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken, SESSION_CONFIG, shouldUseSecureCookies, type AuthUser } from '@/lib/auth';
import { rateLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// Request body interface
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Maximum failed attempts before lockout - SEC-015
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - SEC-005
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const { success, limit, remaining, reset } = await rateLimiter.limit(ip);
    
    if (!success) {
      logger.warn({ ip, event: 'rate_limit_exceeded' }, 'Trop de tentatives de connexion');
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { status: 429, headers: { 
          'X-RateLimit-Limit': limit.toString(), 
          'X-RateLimit-Remaining': remaining.toString(), 
          'X-RateLimit-Reset': reset.toString() 
        } }
      );
    }

    // Parse request body
    let body: LoginRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Corps de la requête invalide' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validate required fields
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'L\'email et le mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user in database
    const dbUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Log failed attempt if user doesn't exist - SEC-014
    if (!dbUser) {
      logger.warn({ 
        ip, 
        email: normalizedEmail, 
        event: 'login_failed',
        reason: 'user_not_found'
      }, 'Tentative de connexion avec un email inexistant');
      
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Check if account is locked out - SEC-015
    if (dbUser.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutExpiresAt = new Date(dbUser.lockoutUntil || 0);
      const now = new Date();
      
      if (now < lockoutExpiresAt) {
        const remainingMinutes = Math.ceil((lockoutExpiresAt.getTime() - now.getTime()) / 60000);
        logger.warn({ 
          ip, 
          userId: dbUser.id, 
          event: 'login_locked_out'
        }, `Compte verrouillé pour ${remainingMinutes} minutes`);
        
        return NextResponse.json(
          { 
            error: 'Forbidden', 
            message: `Ce compte est temporairement verrouillé. Réessayez dans ${remainingMinutes} minutes.` 
          },
          { status: 403 }
        );
      } else {
        // Lockout expired, reset failed attempts
        await db.user.update({
          where: { id: dbUser.id },
          data: { failedAttempts: 0, lockoutUntil: null },
        });
      }
    }

    // Verify password
    // ⚠️ await OBLIGATOIRE : verifyPassword retourne une Promise<boolean>.
    // Sans await, la Promise est toujours truthy et N'IMPORTE QUEL mot de
    // passe serait accepté (faille critique observée le 2026-09-30).
    const isValidPassword = await verifyPassword(password, dbUser.password);
    
    if (!isValidPassword) {
      // Increment failed attempts - SEC-015
      const newFailedAttempts = dbUser.failedAttempts + 1;
      const lockoutUntil = newFailedAttempts >= MAX_FAILED_ATTEMPTS 
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : null;
      
      await db.user.update({
        where: { id: dbUser.id },
        data: { 
          failedAttempts: newFailedAttempts,
          lockoutUntil,
          updatedAt: new Date()
        },
      });

      logger.warn({ 
        ip, 
        userId: dbUser.id, 
        email: normalizedEmail,
        failedAttempts: newFailedAttempts,
        event: 'login_failed'
      }, 'Tentative de connexion échouée');
      
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    if (dbUser.failedAttempts > 0) {
      await db.user.update({
        where: { id: dbUser.id },
        data: { failedAttempts: 0, lockoutUntil: null },
      });
    }

    // Check user status
    if (dbUser.status === 'SUSPENDED') {
      logger.warn({ userId: dbUser.id, event: 'login_suspended' }, 'Tentative de connexion avec un compte suspendu');
      return NextResponse.json(
        { error: 'Forbidden', message: 'Ce compte a été suspendu' },
        { status: 403 }
      );
    }

    if (dbUser.status === 'INACTIVE') {
      logger.warn({ userId: dbUser.id, event: 'login_inactive' }, 'Tentative de connexion avec un compte inactif');
      return NextResponse.json(
        { error: 'Forbidden', message: 'Ce compte est inactif' },
        { status: 403 }
      );
    }

    // Check email verification - SEC-016
    if (!dbUser.emailVerified) {
      logger.warn({ userId: dbUser.id, event: 'login_unverified' }, 'Tentative de connexion avec un email non vérifié');
      return NextResponse.json(
        { 
          error: 'Forbidden', 
          message: 'Veuillez vérifier votre adresse email avant de vous connecter.' 
        },
        { status: 403 }
      );
    }

    // Build auth user object
    const user: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      role: dbUser.role,
      status: dbUser.status,
    };

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Ce compte n’est pas actif' },
        { status: 403 }
      );
    }

    // Generate session token
    const token = generateToken();

    // Calculate expiry time
    const expiresAt = Date.now() + SESSION_CONFIG.maxAge * 1000;

    // Create session in database
    await db.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(expiresAt),
      },
    });

    // Generate or update refresh token - SEC-011
    let refreshToken = dbUser.refreshToken;
    let refreshTokenExpiresAt = dbUser.refreshTokenExpiresAt;
    
    // If no refresh token or it's expired, generate a new one
    if (!refreshToken || !refreshTokenExpiresAt || new Date() > refreshTokenExpiresAt) {
      refreshToken = generateToken();
      refreshTokenExpiresAt = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000); // 30 days
      
      await db.user.update({
        where: { id: user.id },
        data: {
          refreshToken,
          refreshTokenExpiresAt,
        },
      });
    }

    // Log successful login - SEC-014
    logger.info({ 
      ip, 
      userId: user.id, 
      email: normalizedEmail,
      event: 'login_success'
    }, 'Connexion réussie');

    // Create response with session cookie
    const response = NextResponse.json(
      {
        success: true,
        user,
        message: 'Connexion réussie',
      },
      { status: 200 }
    );

    // Set HTTP-only session cookie - SEC-008: sameSite strict.
    // `Secure` seulement si la requête est réellement en HTTPS (sinon les
    // navigateurs jetteraient le cookie sur http://IP-LAN → boucle de login).
    const useSecure = shouldUseSecureCookies(request);
    response.cookies.set(SESSION_CONFIG.cookieName, token, {
      httpOnly: SESSION_CONFIG.httpOnly,
      secure: useSecure,
      sameSite: 'strict',
      path: SESSION_CONFIG.path,
      maxAge: SESSION_CONFIG.maxAge,
    });

    // Set refresh token cookie - SEC-011
    if (refreshToken) {
      response.cookies.set('archedamour_refresh', refreshToken, {
        httpOnly: true,
        secure: useSecure,
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    logger.error({ error, event: 'login_error' }, 'Erreur lors de la connexion');
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}

