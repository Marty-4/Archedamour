/**
 * Arche d'Amour - Pagination Utilities
 * 
 * Centralized pagination logic for API endpoints
 * - DB-002: Implement pagination for all list endpoints
 */

import { z } from 'zod';

// Default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Pagination query schema
const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Parse and validate pagination parameters from URL search params
 */
export function parsePaginationParams(searchParams: URLSearchParams | Record<string, string | string[]> | undefined) {
  // Convert searchParams to a plain object if it's URLSearchParams
  let params: Record<string, string> = {};
  
  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } else if (searchParams) {
    params = Object.entries(searchParams).reduce((acc, [key, value]) => {
      acc[key] = Array.isArray(value) ? value[0] : value;
      return acc;
    }, {} as Record<string, string>);
  }

  // Parse and validate
  const result = paginationQuerySchema.safeParse(params);
  
  if (!result.success) {
    // Return defaults on validation error
    return {
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      sortBy: undefined,
      sortOrder: 'desc' as const,
      skip: 0,
      take: DEFAULT_LIMIT,
    };
  }

  const { page, limit, sortBy, sortOrder } = result.data;
  const skip = (page - 1) * limit;
  const take = limit;

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    skip,
    take,
  };
}

/**
 * Create pagination metadata for API responses
 */
export function createPaginationMeta<T>(
  data: T[],
  total: number,
  pagination: {
    page: number;
    limit: number;
    skip: number;
    take: number;
  }
) {
  const { page, limit, skip, take } = pagination;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const nextPage = hasNextPage ? page + 1 : null;
  const prevPage = hasPrevPage ? page - 1 : null;

  return {
    data,
    meta: {
      total,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage,
      skip,
      take,
    },
  };
}

/**
 * Prisma pagination helper
 * Returns the skip and take values for Prisma queries
 */
export function getPrismaPagination(page: number = DEFAULT_PAGE, limit: number = DEFAULT_LIMIT) {
  const skip = (page - 1) * limit;
  const take = limit;
  
  return { skip, take };
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    skip: number;
    take: number;
  };
}

/**
 * Pagination parameters type
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  skip: number;
  take: number;
}

// Export the schema for use in other files
export { paginationQuerySchema };
