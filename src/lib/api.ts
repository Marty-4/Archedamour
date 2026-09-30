/**
 * Arche d'Amour - API Client Utilities
 * 
 * Centralized API client with error handling
 * - FE-001: Global error handling for API requests
 */

import { toast } from 'sonner';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Error types
export type ApiError = {
  error: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  status?: number;
};

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Parse API error response
 */
export function parseApiError(response: Response, data: any): ApiClientError {
  const status = response.status;
  
  // Handle different error formats
  if (data?.error && data?.message) {
    return new ApiClientError(
      status,
      data.message,
      data,
      data.errors
    );
  }
  
  if (data?.message) {
    return new ApiClientError(status, data.message, data);
  }
  
  if (status === 401) {
    return new ApiClientError(status, 'Non autorisé. Veuillez vous connecter.');
  }
  
  if (status === 403) {
    return new ApiClientError(status, 'Accès refusé. Vous n\'avez pas les permissions nécessaires.');
  }
  
  if (status === 404) {
    return new ApiClientError(status, 'Ressource non trouvée.');
  }
  
  if (status === 429) {
    return new ApiClientError(status, 'Trop de requêtes. Veuillez réessayer plus tard.');
  }
  
  if (status >= 500) {
    return new ApiClientError(status, 'Une erreur serveur est survenue. Veuillez réessayer plus tard.');
  }
  
  return new ApiClientError(status, 'Une erreur est survenue.');
}

/**
 * Default error handler
 * Shows toast notifications for errors
 */
export function defaultErrorHandler(error: unknown): void {
  if (error instanceof ApiClientError) {
    // Don't show toast for 401 (will be handled by auth redirect)
    if (error.status !== 401) {
      toast.error(error.message);
    }
    return;
  }
  
  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }
  
  toast.error('Une erreur inconnue est survenue');
}

/**
 * API request options
 */
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  query?: Record<string, string | number | boolean>;
  handleError?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiClientError) => void;
}

/**
 * Build URL with query parameters
 */
function buildUrl(path: string, query?: Record<string, string | number | boolean>): string {
  const url = new URL(path, API_BASE_URL);
  
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

/**
 * Main API client function
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    params,
    query,
    handleError = true,
    onSuccess,
    onError,
    ...fetchOptions
  } = options;
  
  // Build URL
  let url = path;
  
  if (params) {
    // Replace path parameters
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  const fullUrl = buildUrl(url, query);
  
  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });
    
    if (!response.ok) {
      let data: any;
      try {
        data = await response.json();
      } catch {
        data = {};
      }
      
      const error = parseApiError(response, data);
      
      if (handleError) {
        defaultErrorHandler(error);
      }
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
    
    const data = await response.json();
    
    if (onSuccess) {
      onSuccess(data);
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    
    // Network errors
    const networkError = new ApiClientError(
      0,
      'Erreur de connexion. Veuillez vérifier votre connexion internet.',
      undefined,
      undefined
    );
    
    if (handleError) {
      defaultErrorHandler(networkError);
    }
    
    if (onError) {
      onError(networkError);
    }
    
    throw networkError;
  }
}

/**
 * Convenience methods for different HTTP verbs
 */

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, 'body'>) => 
    apiRequest<T>(path, { ...options, method: 'GET' }),
  
  post: <T>(path: string, body?: any, options?: ApiRequestOptions) => 
    apiRequest<T>(path, { 
      ...options, 
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  put: <T>(path: string, body?: any, options?: ApiRequestOptions) => 
    apiRequest<T>(path, { 
      ...options, 
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  patch: <T>(path: string, body?: any, options?: ApiRequestOptions) => 
    apiRequest<T>(path, { 
      ...options, 
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  delete: <T>(path: string, options?: ApiRequestOptions) => 
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

/**
 * Hook for using the API client in React components
 * This is a simple wrapper that can be extended with React Query
 */
export function useApi() {
  return {
    get: api.get,
    post: api.post,
    put: api.put,
    patch: api.patch,
    delete: api.delete,
    request: apiRequest,
  };
}
