/**
 * Arche d'Amour - Register API Route
 * POST /api/auth/register
 * 
 * Handles user registration and account creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureUserBelongsToChurch } from '@/lib/church';
import { hashPassword, generateToken, SESSION_CONFIG, isValidEmail, type AuthUser, validatePasswordStrength } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimiter } from '@/lib/rate-limit';

// Request body interface
interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - SEC-005
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const { success } = await rateLimiter.limit(ip);
    
    if (!success) {
      logger.warn({ ip, event: 'rate_limit_exceeded' }, 'Trop de tentatives d\'inscription');
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { status: 429 }
      );
    }

    // Parse request body
    let body: RegisterRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Corps de la requête invalide' },
        { status: 400 }
      );
    }

    const { name, email, phone, password, confirmPassword, acceptTerms } = body;

    // Validate required fields
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof confirmPassword !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Le nom, l\'email et le mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Le nom doit contenir au moins 2 caractères' },
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

    // Validate password strength using utility function
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Validation Error', message: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Les mots de passe ne correspondent pas' },
        { status: 400 }
      );
    }

    // Check terms acceptance - SEC-006
    if (acceptTerms !== true && acceptTerms !== undefined) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Vous devez accepter les conditions d\'utilisation' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      logger.warn({ ip, email: normalizedEmail, event: 'registration_failed' }, 'Tentative d\'inscription avec un email existant');
      return NextResponse.json(
        { error: 'Conflict', message: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      );
    }

    // Hash password - SEC-012: Uses Argon2
    const hashedPassword = await hashPassword(password);

    // Generate refresh token - SEC-011
    const refreshToken = generateToken();
    const refreshTokenExpiresAt = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000); // 30 days

    // Create new user with default MEMBER role
    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'MEMBER',
        status: 'ACTIVE',
        // TODO(email-vérification) : passer à false quand un envoi d'email
        // (token + route /verify-email) sera en place. Aujourd'hui, aucun
        // service d'email n'existe : laisser false bloquerait tout nouvel
        // inscrit à la connexion, pour toujours.
        emailVerified: true,
        refreshToken,
        refreshTokenExpiresAt,
      },
    });

    // Mono-église : chaque nouvel inscrit appartient immédiatement à
    // l'église Arche d'Amour (profil minimal, complété plus tard).
    try {
      await ensureUserBelongsToChurch(newUser.id);
    } catch {
      // Jamais bloquant pour la création du compte (rattrapage à la première
      // visite de l'espace membre).
    }

    // Create auth user object (without password)
    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      role: newUser.role,
      status: newUser.status,
    };

    // Generate session token for auto-login after registration
    const token = generateToken();
    const expiresAt = Date.now() + SESSION_CONFIG.maxAge * 1000;

    // Create session in database
    await db.session.create({
      data: {
        token,
        userId: newUser.id,
        expiresAt: new Date(expiresAt),
      },
    });

    // Create response with session cookie
    const response = NextResponse.json(
      {
        success: true,
        user: authUser,
        message: 'Compte créé avec succès',
      },
      { status: 201 }
    );

    // Set HTTP-only session cookie - SEC-007: secure always true, SEC-008: sameSite strict
    response.cookies.set(SESSION_CONFIG.cookieName, token, {
      httpOnly: SESSION_CONFIG.httpOnly,
      secure: true, // Always secure
      sameSite: 'strict', // CSRF protection
      path: SESSION_CONFIG.path,
      maxAge: SESSION_CONFIG.maxAge,
    });

    // Set refresh token cookie - SEC-011
    response.cookies.set('archedamour_refresh', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Log successful registration
    logger.info({ userId: newUser.id, email: normalizedEmail, event: 'registration_success' }, 'Inscription réussie');

    return response;
  } catch (error) {
    logger.error({ error, event: 'registration_error' }, 'Erreur lors de l\'inscription');
    
    // Handle unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Conflict', message: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}

