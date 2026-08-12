/**
 * ChurchConnect - Login API Route
 * POST /api/auth/login
 * 
 * Handles user authentication and session creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, SESSION_CONFIG, type AuthUser } from '@/lib/auth';

// Request body interface
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Demo mode flag - set to true to allow any login for demo purposes
const DEMO_MODE = true;

// Demo users for testing (when demo mode is enabled)
const DEMO_USERS = [
  {
    id: 'demo-user-1',
    email: 'pasteur@churchconnect.com',
    name: 'Pasteur Jean',
    password: 'password123',
    role: 'PASTOR' as const,
  },
  {
    id: 'demo-user-2',
    email: 'admin@churchconnect.com',
    name: 'Admin Marie',
    password: 'admin123',
    role: 'ADMIN' as const,
  },
  {
    id: 'demo-user-3',
    email: 'membre@churchconnect.com',
    name: 'Membre Pierre',
    password: 'membre123',
    role: 'MEMBER' as const,
  },
];

export async function POST(request: NextRequest) {
  try {
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
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'L\'email et le mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    let user: AuthUser | null = null;

    if (DEMO_MODE) {
      // Check for demo users first
      const demoUser = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
      );

      if (demoUser) {
        // Check if user exists in database, create if not
        const dbUser = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!dbUser) {
          const createdUser = await db.user.create({
            data: {
              email: demoUser.email,
              name: demoUser.name,
              password: hashPassword(demoUser.password),
              role: demoUser.role,
              status: 'ACTIVE',
              emailVerified: true,
            },
          });
          
          user = {
            id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
            avatar: createdUser.avatar,
            role: createdUser.role,
            status: createdUser.status,
          };
        } else {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            avatar: dbUser.avatar,
            role: dbUser.role,
            status: dbUser.status,
          };
        }
      } else {
        // In demo mode, accept any email/password combination and create/find user
        const existingUser = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (existingUser) {
          user = {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            avatar: existingUser.avatar,
            role: existingUser.role,
            status: existingUser.status,
          };
        } else {
          // Create new user with provided credentials
          const newUser = await db.user.create({
            data: {
              email: normalizedEmail,
              name: normalizedEmail.split('@')[0],
              password: hashPassword(password),
              role: 'MEMBER',
              status: 'ACTIVE',
            },
          });
          
          user = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            avatar: newUser.avatar,
            role: newUser.role,
            status: newUser.status,
          };
        }
      }
    } else {
      // Production mode - validate against database only
      const dbUser = await db.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!dbUser) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = hashPassword(password) === dbUser.password;
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }

      // Check user status
      if (dbUser.status === 'SUSPENDED') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Ce compte a été suspendu' },
          { status: 403 }
        );
      }

      if (dbUser.status === 'INACTIVE') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Ce compte est inactif' },
          { status: 403 }
        );
      }

      user = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        role: dbUser.role,
        status: dbUser.status,
      };
    }

    // Generate session token
    const token = generateToken();

    // Calculate expiry time
    const expiresAt = Date.now() + SESSION_CONFIG.maxAge * 1000;

    // Create session in database
    try {
      await db.session.create({
        data: {
          token,
          userId: user!.id,
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
        user,
        message: 'Connexion réussie',
      },
      { status: 200 }
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}
