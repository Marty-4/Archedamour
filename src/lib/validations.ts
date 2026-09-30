/**
 * Arche d'Amour - Validation Schemas
 * 
 * Centralized validation schemas using Zod
 * - API-003: Validate all API inputs with Zod
 */

import { z } from 'zod';

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[a-zA-Z]/, 'Le mot de passe doit contenir au moins une lettre')
    .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Le token est requis'),
  newPassword: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[a-zA-Z]/, 'Le mot de passe doit contenir au moins une lettre')
    .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Les nouveaux mots de passe ne correspondent pas',
  path: ['confirmNewPassword'],
});

// ============================================
// USER VALIDATION SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Veuillez entrer une URL valide').optional(),
  bio: z.string().max(500, 'La biographie ne doit pas dépasser 500 caractères').optional(),
});

// ============================================
// GROUP VALIDATION SCHEMAS
// ============================================

export const createGroupSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().max(500, 'La description ne doit pas dépasser 500 caractères').optional(),
  meetingDay: z.string().optional(),
  meetingTime: z.string().optional(),
  location: z.string().optional(),
  maxSize: z.number().int().positive('La taille maximale doit être un nombre positif').optional(),
});

export const groupMessageSchema = z.object({
  groupId: z.string().min(1, 'L\'ID du groupe est requis'),
  message: z.string().min(1, 'Le message est requis').max(2000, 'Le message ne doit pas dépasser 2000 caractères'),
});

// ============================================
// POST VALIDATION SCHEMAS
// ============================================

export const createPostSchema = z.object({
  content: z.string().min(1, 'Le contenu est requis').max(5000, 'Le contenu ne doit pas dépasser 5000 caractères'),
  type: z.enum(['TESTIMONY', 'PRAYER_REQUEST', 'GENERAL', 'ANNOUNCEMENT']).optional(),
  imageUrl: z.string().url('Veuillez entrer une URL valide').optional(),
  visibility: z.enum(['PUBLIC', 'MEMBERS', 'DEPARTMENT', 'PRIVATE']).optional(),
});

// ============================================
// COMMENT VALIDATION SCHEMAS
// ============================================

export const createCommentSchema = z.object({
  postId: z.string().min(1, 'L\'ID du post est requis'),
  content: z.string().min(1, 'Le contenu est requis').max(2000, 'Le commentaire ne doit pas dépasser 2000 caractères'),
  parentId: z.string().optional(),
});

// ============================================
// PAGINATION SCHEMAS - DB-002
// ============================================

export const paginationSchema = z.object({
  page: z.number().int().positive('La page doit être un nombre positif').default(1),
  limit: z.number().int().positive('La limite doit être un nombre positif').max(100, 'La limite ne peut pas dépasser 100').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ============================================
// SEARCH SCHEMAS
// ============================================

export const searchSchema = z.object({
  query: z.string().min(1, 'La requête de recherche est requise').max(200, 'La requête ne doit pas dépasser 200 caractères'),
  type: z.string().optional(),
});

// ============================================
// ID PARAMETER SCHEMAS
// ============================================

export const idParamSchema = z.object({
  id: z.string().min(1, 'L\'ID est requis'),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('L\'ID doit être un UUID valide'),
});

// ============================================
// DATE SCHEMAS
// ============================================

export const dateRangeSchema = z.object({
  startDate: z.string().datetime('La date de début doit être une date valide').optional(),
  endDate: z.string().datetime('La date de fin doit être une date valide').optional(),
});

// ============================================
// FILE UPLOAD SCHEMAS
// ============================================

export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024,
    'Le fichier ne doit pas dépasser 10 Mo'
  ),
  type: z.enum(['image', 'video', 'document', 'audio']).optional(),
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors).map(([field, error]) => ({
      field,
      message: error?.[0] || 'Validation error',
    }));
    
    throw new Error(JSON.stringify({
      type: 'VALIDATION_ERROR',
      errors: errorMessages,
    }));
  }
  
  return result.data;
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(schema: z.ZodSchema<T>, query: unknown): T {
  const result = schema.safeParse(query);
  
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors).map(([field, error]) => ({
      field,
      message: error?.[0] || 'Validation error',
    }));
    
    throw new Error(JSON.stringify({
      type: 'VALIDATION_ERROR',
      errors: errorMessages,
    }));
  }
  
  return result.data;
}

// ============================================
// EXPORT ALL SCHEMAS
// ============================================

export const schemas = {
  auth: {
    login: loginSchema,
    register: registerSchema,
    forgotPassword: forgotPasswordSchema,
    resetPassword: resetPasswordSchema,
  },
  user: {
    updateProfile: updateProfileSchema,
  },
  group: {
    create: createGroupSchema,
    message: groupMessageSchema,
  },
  post: {
    create: createPostSchema,
  },
  comment: {
    create: createCommentSchema,
  },
  pagination: paginationSchema,
  query: paginationQuerySchema,
  search: searchSchema,
  params: {
    id: idParamSchema,
    uuid: uuidParamSchema,
  },
  date: dateRangeSchema,
  file: fileUploadSchema,
};
