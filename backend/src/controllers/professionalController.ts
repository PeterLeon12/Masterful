import { Request, Response } from 'express';
import { databaseService } from '../services/databaseService';
import { logger } from '../utils/logger';

export const professionalController = {
  // Get all professionals with filtering
  async getProfessionals(req: Request, res: Response) {
    try {
      const {
        categories,
        minRating,
        maxHourlyRate,
        isAvailable,
        limit = '20',
        offset = '0',
      } = req.query;

      const filters: any = {};
      
      if (categories) {
        filters.categories = Array.isArray(categories) ? categories : [categories];
      }
      if (minRating) filters.minRating = parseFloat(minRating as string);
      if (maxHourlyRate) filters.maxHourlyRate = parseFloat(maxHourlyRate as string);
      if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';

      const { professionals, total } = await databaseService.findProfessionals({
        ...filters,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      return res.status(200).json({
        success: true,
        data: {
          professionals,
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      logger.error('Get professionals error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea profesioniștilor',
        code: 'PROFESSIONALS_FETCH_ERROR',
      });
    }
  },

  // Get professional by ID
  async getProfessionalById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const professional = await databaseService.findProfessionalById(id);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profesionistul nu a fost găsit',
          code: 'PROFESSIONAL_NOT_FOUND',
        });
      }

      return res.status(200).json({
        success: true,
        data: { professional },
      });
    } catch (error) {
      logger.error('Get professional by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea profesionistului',
        code: 'PROFESSIONAL_FETCH_ERROR',
      });
    }
  },

  // Create or update professional profile
  async updateProfessionalProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const {
        categories,
        hourlyRate,
        currency,
        experience,
        bio,
        portfolio,
        certifications,
        insurance,
        workingHours,
        serviceAreas,
      } = req.body;

      // Check if user is a professional
      const user = await databaseService.findUserById(userId);
      if (!user || user.role !== 'PROFESSIONAL') {
        return res.status(403).json({
          success: false,
          message: 'Doar profesioniștii pot actualiza profilul profesional',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Check if professional profile exists
      const existingProfessional = await databaseService.findProfessionalByUserId(userId);
      
      const professionalData = {
        userId,
        categories: categories || '',
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
        currency: currency || 'RON',
        experience: experience ? parseInt(experience) : 0,
        bio: bio || '',
        portfolio: portfolio || '',
        certifications: certifications || '',
        insurance: insurance || false,
        workingHours: workingHours || '',
        serviceAreas: serviceAreas || '',
      };

      let professional;
      if (existingProfessional) {
        professional = await databaseService.updateProfessional(existingProfessional.id, professionalData);
      } else {
        professional = await databaseService.createProfessional(professionalData);
      }

      logger.info(`Professional profile updated for user: ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Profilul profesional a fost actualizat cu succes!',
        data: { professional },
      });
    } catch (error) {
      logger.error('Update professional profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la actualizarea profilului profesional',
        code: 'PROFESSIONAL_UPDATE_ERROR',
      });
    }
  },

  // Get professional's jobs
  async getProfessionalJobs(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { status, limit = '20', offset = '0' } = req.query;

      const filters: any = { professionalId: userId };
      if (status) filters.status = status;

      const { jobs, total } = await databaseService.findJobs({
        ...filters,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      return res.status(200).json({
        success: true,
        data: {
          jobs,
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      logger.error('Get professional jobs error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea job-urilor',
        code: 'JOBS_FETCH_ERROR',
      });
    }
  },

  // Get professional's applications
  async getProfessionalApplications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { status, limit = '20', offset = '0' } = req.query;

      const applications = await databaseService.findProfessionalApplications(userId, {
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      return res.status(200).json({
        success: true,
        data: { applications },
      });
    } catch (error) {
      logger.error('Get professional applications error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea aplicațiilor',
        code: 'APPLICATIONS_FETCH_ERROR',
      });
    }
  },

  // Update professional availability
  async updateAvailability(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { isAvailable } = req.body;

      if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Disponibilitatea trebuie să fie true sau false',
          code: 'INVALID_AVAILABILITY',
        });
      }

      const professional = await databaseService.findProfessionalByUserId(userId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Profilul profesional nu a fost găsit',
          code: 'PROFESSIONAL_NOT_FOUND',
        });
      }

      const updatedProfessional = await databaseService.updateProfessional(professional.id, {
        isAvailable,
      });

      logger.info(`Professional availability updated for user: ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Disponibilitatea a fost actualizată cu succes!',
        data: { professional: updatedProfessional },
      });
    } catch (error) {
      logger.error('Update availability error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la actualizarea disponibilității',
        code: 'AVAILABILITY_UPDATE_ERROR',
      });
    }
  },

  // Get professional reviews
  async getProfessionalReviews(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { limit = '20', offset = '0' } = req.query;

      const reviews = await databaseService.findProfessionalReviews(id, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      return res.status(200).json({
        success: true,
        data: { reviews },
      });
    } catch (error) {
      logger.error('Get professional reviews error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea recenziilor',
        code: 'REVIEWS_FETCH_ERROR',
      });
    }
  },
};
