/**
 * Arche d'Amour - Sentry Configuration
 * 
 * Error monitoring and reporting with Sentry
 * - DEV-002: Add Sentry for monitoring errors in production
 */

// Sentry instance - typed as any to avoid TypeScript errors when package is not installed
declare let Sentry: any;

// Flag to track if Sentry is initialized
let isSentryInitialized = false;

async function initSentry() {
  const nodeEnv: string = process.env.NODE_ENV || 'development';
  const dsn = process.env.SENTRY_DSN;
  
  if (nodeEnv === 'production' && dsn) {
    try {
      // Import dynamique : le package est optionnel (chargé seulement en
      // production avec un DSN configuré).
      const sentryModule = await import('@sentry/nextjs');
      Sentry = sentryModule.default || sentryModule;
      
      Sentry.init({
        dsn: dsn,
        
        // Performance Monitoring
        tracesSampleRate: 0.1, // 10% of transactions
        
        // Error Monitoring
        sendDefaultPii: false,
        
        // Environment
        environment: nodeEnv,
        
        // Release
        release: process.env.nxt_RELEASE || 'unknown',
        
        // Integrations
        integrations: [
          Sentry.httpIntegration(),
          Sentry.nextjsIntegration(),
        ],
        
        // Debug
        // @ts-ignore - TypeScript incorrectly flags this comparison
        debug: nodeEnv === 'development',
      });
      isSentryInitialized = true;
    } catch {
      // Package not installed, Sentry remains undefined
    }
  }
}

// Initialize Sentry
initSentry().catch(() => {});

// Export Sentry utilities (will be undefined if not initialized)
export { Sentry };

/**
 * Capture an error with Sentry
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (Sentry && isSentryInitialized) {
    Sentry.captureException(error, { contexts: context });
  } else {
    console.error('Error:', error, context);
  }
}

/**
 * Capture a message with Sentry
 */
export function captureMessage(message: string, context?: Record<string, any>) {
  if (Sentry && isSentryInitialized) {
    Sentry.captureMessage(message, { contexts: context });
  } else {
    console.warn('Message:', message, context);
  }
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: string; email?: string; name?: string }) {
  if (Sentry && isSentryInitialized) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }
}

/**
 * Clear user context from Sentry
 */
export function clearSentryUser() {
  if (Sentry && isSentryInitialized) {
    Sentry.setUser(null);
  }
}

/**
 * Start a Sentry transaction
 */
export function startTransaction(name: string, operation?: string) {
  if (Sentry && isSentryInitialized) {
    return Sentry.startTransaction({ name, op: operation });
  }
  return null;
}

/**
 * Set transaction status
 */
export function setTransactionStatus(transaction: any, status: 'ok' | 'failed' | 'cancelled') {
  if (transaction && Sentry && isSentryInitialized) {
    transaction.setStatus(status);
  }
}

/**
 * Finish a Sentry transaction
 */
export function finishTransaction(transaction: any) {
  if (transaction && Sentry && isSentryInitialized) {
    transaction.finish();
  }
}
