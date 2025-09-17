import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Extend Express Request interface to include user
declare global {
  namespace Express {
      interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        message: 'Token de acces necesar'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        message: 'Format token invalid'
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env["JWT_SECRET"]!) as any;
      
      if (!decoded || !decoded.userId) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'Token invalid'
        });
      }

      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          isVerified: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          message: 'Utilizatorul nu a fost găsit'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'User account is deactivated',
          message: 'Contul utilizatorului este dezactivat'
        });
      }

      // Add user to request object
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      return next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Token-ul a expirat'
        });
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'Token invalid'
        });
      } else {
        logger.error('JWT verification error:', jwtError);
        return res.status(401).json({
          success: false,
          error: 'Token verification failed',
          message: 'Verificarea token-ului a eșuat'
        });
      }
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Eroare internă a serverului'
    });
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Autentificare necesară'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: 'Permisiuni insuficiente'
      });
    }

    return next();
  };
};

// Require specific role
export const requireClient = requireRole(['CLIENT']);
export const requireProfessional = requireRole(['PROFESSIONAL']);
export const requireAdmin = requireRole(['ADMIN']);

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env["JWT_SECRET"]!) as any;
      
      if (decoded && decoded.userId) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true
          }
        });

        if (user && user.isActive) {
          req.user = user;
        }
      }
    } catch (jwtError) {
      // Silently ignore JWT errors for optional auth
      logger.debug('Optional auth JWT error (ignored):', jwtError);
    }

    return next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    return next(); // Continue even on error
  }
};
