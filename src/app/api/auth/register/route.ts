/**
 * Arche d'Amour - Register API Route
 * POST /api/auth/register
 * 
 * Handles user registration and account creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, SESSION_CONFIG, isValidEmail, type AuthUser } from '@/lib/auth';

// Request body interface
interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export async function POST(request: NextRequest) {
  try {
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
    if (!name || !email || !password) {
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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    if (!/[a-zA-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Le mot de passe doit contenir au moins une lettre' },
        { status: 400 }
      );
    }

    if (!/\d/.test(password)) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Le mot de passe doit contenir au moins un chiffre' },
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

    // Check terms acceptance
    if (!acceptTerms) {
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
      return NextResponse.json(
        { error: 'Conflict', message: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create new user with default MEMBER role
    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'MEMBER',
        status: 'ACTIVE',
        emailVerified: false,
      },
    });

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
    try {
      await db.session.create({
        data: {
          token,
          userId: newUser.id,
          expiresAt: new Date(expiresAt),
        },
      });
    } catch (sessionError) {
      console.error('Failed to create session:', sessionError);
      // Continue without storing session if it fails
    }

    // Create response with session cookie
    const response = NextResponse.json(
      {
        success: true,
        user: authUser,
        message: 'Compte créé avec succès',
      },
      { status: 201 }
    );

    // Set HTTP-only session cookie
    response.cookies.set(SESSION_CONFIG.cookieName, token, {
      httpOnly: SESSION_CONFIG.httpOnly,
      secure: SESSION_CONFIG.secure,
      sameSite: SESSION_CONFIG.sameSite,
      path: SESSION_CONFIG.path,
      maxAge: SESSION_CONFIG.maxAge,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
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
