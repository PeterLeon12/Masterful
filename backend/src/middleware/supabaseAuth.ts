import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabaseService';
import { logger } from '../utils/logger';

// Extend Request interface to include user
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

export const supabaseAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de autentificare lipsă',
        code: 'MISSING_TOKEN',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseService.client.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        message: 'Token de autentificare invalid',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    // Get user profile from database
    const userProfile = await supabaseService.findUserById(user.id);
    
    if (!userProfile) {
      res.status(404).json({
        success: false,
        message: 'Profilul utilizatorului nu a fost găsit',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    if (!userProfile.is_active) {
      res.status(403).json({
        success: false,
        message: 'Contul utilizatorului este dezactivat',
        code: 'ACCOUNT_DISABLED',
      });
      return;
    }

    // Add user to request
    req.user = {
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
    };

    next();
  } catch (error) {
    logger.error('Supabase auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare la autentificare',
      code: 'AUTH_ERROR',
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Utilizator neautentificat',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Nu aveți permisiuni suficiente',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    next();
  };
};

export const requireProfessional = requireRole(['PROFESSIONAL', 'ADMIN']);
export const requireClient = requireRole(['CLIENT', 'ADMIN']);
export const requireAdmin = requireRole(['ADMIN']);
