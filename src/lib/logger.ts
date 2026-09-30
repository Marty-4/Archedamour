/**
 * Arche d'Amour - Structured Logger
 * 
 * Uses Pino for structured logging
 * Logs to console in development, to a file or external service in production
 */

import pino from 'pino';
import { IncomingMessage, ServerResponse } from 'http';

// Create logger instance
const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: process.env.NODE_ENV !== 'production',
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
  base: null, // Don't include default base object
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', 'token', 'email', 'userId'], // Redact sensitive fields
    censor: '[REDACTED]',
  },
});

// Add request ID to logs for tracing
export const withRequestId = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(2, 9);
  const childLogger = logger.child({ requestId });
  
  // Store logger in request for use in route handlers
  (req as any).logger = childLogger;
  
  // Log request start
  childLogger.info({
    method: req.method,
    url: req.url,
    ip: req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  }, 'Request started');
  
  // Log request end
  res.on('finish', () => {
    childLogger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
    }, 'Request completed');
  });
  
  next();
};

// Export logger
export { logger };

// Helper to log with context
export const logWithContext = (context: Record<string, any>) => {
  return logger.child(context);
};

// Export types for TypeScript
declare module 'http' {
  interface IncomingMessage {
    logger?: pino.Logger;
  }
}
