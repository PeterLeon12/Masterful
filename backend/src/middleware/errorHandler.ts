import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let userMessage = 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.';
  let details = null;

  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id
  });

  // Handle Prisma errors
  if (error instanceof (Prisma as any).PrismaClientKnownRequestError) {
    switch ((error as any).code) {
      case 'P2002':
        statusCode = 409;
        message = 'Unique constraint violation';
        userMessage = 'Această resursă există deja.';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        userMessage = 'Resursa căutată nu a fost găsită.';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint violation';
        userMessage = 'Datele introduse nu sunt valide.';
        break;
      default:
        statusCode = 400;
        message = 'Database error';
        userMessage = 'Eroare de bază de date.';
    }
  } else if (error instanceof (Prisma as any).PrismaClientValidationError) {
    statusCode = 400;
    message = 'Validation error';
    userMessage = 'Datele introduse nu sunt valide.';
  } else if (error instanceof (Prisma as any).PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = 'Database error';
    userMessage = 'Eroare de bază de date.';
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    userMessage = 'Token invalid.';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    userMessage = 'Token-ul a expirat. Te rugăm să te conectezi din nou.';
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    userMessage = 'Datele introduse nu sunt valide.';
  }

  // Handle rate limiting errors
  if (error.message && error.message.includes('Too many requests')) {
    statusCode = 429;
    message = 'Rate limit exceeded';
    userMessage = 'Ai făcut prea multe cereri. Te rugăm să aștepți puțin înainte să încerci din nou.';
  }

  // Handle file upload errors
  if (error.message && error.message.includes('File too large')) {
    statusCode = 400;
    message = 'File too large';
    userMessage = 'Fișierul este prea mare.';
  }

  if (error.message && error.message.includes('Invalid file type')) {
    statusCode = 400;
    message = 'Invalid file type';
    userMessage = 'Tipul de fișier nu este permis.';
  }

  // Handle network errors
  if (error.message && error.message.includes('ECONNREFUSED')) {
    statusCode = 503;
    message = 'Service unavailable';
    userMessage = 'Serviciul nu este disponibil momentan. Te rugăm să încerci din nou mai târziu.';
  }

  // Handle timeout errors
  if (error.message && error.message.includes('ETIMEDOUT')) {
    statusCode = 504;
    message = 'Gateway timeout';
    userMessage = 'Cererea a expirat. Te rugăm să încerci din nou.';
  }

  // Development vs Production error details
  if (process.env["NODE_ENV"] === 'development') {
    details = {
      stack: error.stack,
      name: error.name,
      code: error.code
    };
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    message: userMessage,
    ...(details && { details }),
    ...(process.env["NODE_ENV"] === 'development' && { 
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    })
  });
};

// 404 handler
export const notFound = (req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: 'Ruta nu a fost găsită',
    path: req.url,
    method: req.method
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code || 'UNKNOWN_ERROR';

    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error types
export const createValidationError = (message: string) => 
  new CustomError(message, 400, 'VALIDATION_ERROR');

export const createNotFoundError = (message: string) => 
  new CustomError(message, 404, 'NOT_FOUND');

export const createUnauthorizedError = (message: string) => 
  new CustomError(message, 401, 'UNAUTHORIZED');

export const createForbiddenError = (message: string) => 
  new CustomError(message, 403, 'FORBIDDEN');

export const createConflictError = (message: string) => 
  new CustomError(message, 409, 'CONFLICT');

export const createTooManyRequestsError = (message: string) => 
  new CustomError(message, 429, 'RATE_LIMIT_EXCEEDED');
