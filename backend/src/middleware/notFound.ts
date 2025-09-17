import { Request, Response } from 'express';
import { logger } from '../utils/logger';

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
