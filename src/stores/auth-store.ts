/**
 * Arche d'Amour Authentication Store
 * Zustand store for managing authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, UserStatus } from '@prisma/client';

// Auth user interface (without sensitive data)
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: Role;
  status: UserStatus;
}

// Store state interface
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Registration data interface
export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms?: boolean;
}

// API response types
interface LoginResponse {
  success: boolean;
  user: AuthUser;
  message: string;
}

interface RegisterResponse {
  success: boolean;
  user: AuthUser;
  message: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Set user directly
      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        error: null,
      }),

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            const errorData = data as ErrorResponse;
            throw new Error(errorData.message || 'Erreur de connexion');
          }

          const loginData = data as LoginResponse;
          
          set({
            user: loginData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur de connexion';
          set({
            isLoading: false,
            error: message,
          });
          throw error;
        }
      },

      // Register action
      register: async (registerData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData),
          });

          const data = await response.json();

          if (!response.ok) {
            const errorData = data as ErrorResponse;
            throw new Error(errorData.message || "Erreur lors de l'inscription");
          }

          const regData = data as RegisterResponse;
          
          set({
            user: regData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erreur lors de l'inscription";
          set({
            isLoading: false,
            error: message,
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          // Continue with logout even if API fails
          console.error('Logout API error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Fetch current user
      fetchUser: async () => {
        set({ isLoading: true });
        
        try {
          const response = await fetch('/api/auth/me');
          const data = await response.json();

          if (response.ok && data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),

      // Set error
      setError: (error) => set({ error }),

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'archedamour-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

export default useAuthStore;
