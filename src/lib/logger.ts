/**
 * Arche d'Amour - Structured Logger
 *
 * Pino logger compatible avec Vercel/serverless.
 * - Développement : logs lisibles avec pino-pretty
 * - Production : JSON natif vers stdout/stderr
 */

import pino from 'pino';
import { IncomingMessage, ServerResponse } from 'http';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // IMPORTANT :
  // pino-pretty ne doit pas être chargé sur Vercel en production.
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }),

  base: null,

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: ['password', 'token', 'email', 'userId'],
    censor: '[REDACTED]',
  },
});

// Add request ID to logs for tracing
export const withRequestId = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => {
  const requestId =
    req.headers['x-request-id'] ||
    Math.random().toString(36).substring(2, 9);

  const childLogger = logger.child({ requestId });

  (req as any).logger = childLogger;

  childLogger.info(
    {
      method: req.method,
      url: req.url,
      ip: req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    },
    'Request started'
  );

  res.on('finish', () => {
    childLogger.info(
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
      },
      'Request completed'
    );
  });

  next();
};

// Export logger
export { logger };

// Helper to log with context
export const logWithContext = (
  context: Record<string, any>
) => {
  return logger.child(context);
};

// Export types for TypeScript
declare module 'http' {
  interface IncomingMessage {
    logger?: pino.Logger;
  }
}