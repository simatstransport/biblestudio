import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Never expose full API keys or sensitive environment variables
  const safeMessage = (err.message || 'Internal server error')
    .replace(/sk-[a-zA-Z0-9_\-]{20,}/g, 'sk-••••••••')
    .replace(/AIza[a-zA-Z0-9_\-]{20,}/g, 'AIza••••••••')
    .replace(/AQ\.[a-zA-Z0-9_\-]{20,}/g, 'AQ.••••••••');

  console.error(`[Error] ${req.method} ${req.url}:`, safeMessage);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);

  return res.status(statusCode).json({
    error: err.name || 'ServerError',
    message: safeMessage,
    code: err.code || undefined
  });
}
