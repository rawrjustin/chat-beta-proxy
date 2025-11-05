import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);

  // Log request body for POST requests (excluding sensitive data)
  if (req.method === 'POST' && req.body) {
    const sanitizedBody = { ...req.body };
    // Don't log full input text if it's too long
    if (sanitizedBody.input && sanitizedBody.input.length > 100) {
      sanitizedBody.input = sanitizedBody.input.substring(0, 100) + '...';
    }
    console.log('Request body:', sanitizedBody);
  }

  next();
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
}
