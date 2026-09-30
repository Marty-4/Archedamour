/**
 * Arche d'Amour - React Query Provider
 * 
 * Centralized query client provider for caching and data fetching
 * - FE-003: Add React Query for caching and better data management
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Note : les ReactQueryDevtools sont volontairement désactivés. Un `require()`
// CJS au niveau module créait une seconde instance de react-query sous
// Turbopack (contexte vide côté SSR → « No QueryClient set » + 500 sur toutes
// les pages). Si vous voulez les devtools plus tard, faites un import statique
// avec une version alignée sur @tanstack/react-query.

/**
 * Default query client configuration
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes (cache garbage collection)
        retry: 1, // Retry once on failure
        refetchOnWindowFocus: false, // Disable automatic refetch on window focus
        refetchOnMount: false, // Disable automatic refetch on mount
      },
      mutations: {
        retry: 0, // Don't retry mutations
      },
    },
  });
}

/**
 * Query Client Provider component
 * Wraps the application with React Query context
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/**
 * Hook to get the query client
 * Useful for prefetching in server components
 */
export function useQueryClient() {
  const client = createQueryClient();
  return client;
}

/**
 * Prefetch query helper for server components
 */
export async function prefetchQuery<T>(
  key: string | string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    gcTime?: number;
  }
) {
  const queryClient = createQueryClient();
  
  return await queryClient.prefetchQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });
}

/**
 * Hydrate query client for server-side rendering
 */
export function hydrateQueryClient(queryClient: QueryClient) {
  return <QueryClientProvider client={queryClient}>{null}</QueryClientProvider>;
}
