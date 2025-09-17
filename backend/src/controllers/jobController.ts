import { Request, Response } from 'express';
import { databaseService } from '../services/databaseService';
import { logger } from '../utils/logger';

export const jobController = {
  async createJob(req: Request, res: Response) {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { title, description, category, subcategory, location, budget, priority, scheduledAt } = req.body;

      // Validate required fields
      if (!title || !description || !category || !location || !budget) {
        return res.status(400).json({
          success: false,
          message: 'Toate câmpurile obligatorii trebuie completate',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      // Create job
      const job = await databaseService.createJob({
        title,
        description,
        category,
        subcategory,
        location: JSON.stringify(location),
        budget: JSON.stringify(budget),
        clientId,
        priority,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      });

      logger.info(`Job created: ${job.title} by ${clientId}`);

      return res.status(201).json({
        success: true,
        message: 'Job creat cu succes!',
        data: { job },
      });
    } catch (error) {
      logger.error('Create job error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la crearea job-ului',
        code: 'JOB_CREATION_ERROR',
      });
    }
  },

  async getJobs(req: Request, res: Response) {
    try {
      const {
        category,
        location,
        status,
        limit = '20',
        offset = '0',
        clientId,
        professionalId,
      } = req.query;

      const filters: any = {};
      if (category) filters.category = category as string;
      if (location) filters.location = location as string;
      if (status) filters.status = status as any;
      if (clientId) filters.clientId = clientId as string;
      if (professionalId) filters.professionalId = professionalId as string;

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
      logger.error('Get jobs error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea job-urilor',
        code: 'JOBS_FETCH_ERROR',
      });
    }
  },

  async getJobById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const job = await databaseService.findJobById(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      return res.status(200).json({
        success: true,
        data: { job },
      });
    } catch (error) {
      logger.error('Get job by ID error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea job-ului',
        code: 'JOB_FETCH_ERROR',
      });
    }
  },

  async updateJob(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      // Get current job to check permissions
      const currentJob = await databaseService.findJobById(id);
      if (!currentJob) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      // Only client who created the job or assigned professional can update it
      if (currentJob.clientId !== userId && currentJob.professionalId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Nu ai permisiunea să modifici acest job',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Prepare update data
      const dataToUpdate: any = {};
      if (updateData.title) dataToUpdate.title = updateData.title;
      if (updateData.description) dataToUpdate.description = updateData.description;
      if (updateData.category) dataToUpdate.category = updateData.category;
      if (updateData.subcategory) dataToUpdate.subcategory = updateData.subcategory;
      if (updateData.location) dataToUpdate.location = JSON.stringify(updateData.location);
      if (updateData.budget) dataToUpdate.budget = JSON.stringify(updateData.budget);
      if (updateData.priority) dataToUpdate.priority = updateData.priority;
      if (updateData.status) dataToUpdate.status = updateData.status;
      if (updateData.scheduledAt) dataToUpdate.scheduledAt = new Date(updateData.scheduledAt);

      const updatedJob = await databaseService.updateJob(id, dataToUpdate);

      logger.info(`Job updated: ${id} by ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Job actualizat cu succes!',
        data: { job: updatedJob },
      });
    } catch (error) {
      logger.error('Update job error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la actualizarea job-ului',
        code: 'JOB_UPDATE_ERROR',
      });
    }
  },

  async deleteJob(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { id } = req.params;

      // Get current job to check permissions
      const currentJob = await databaseService.findJobById(id);
      if (!currentJob) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      // Only client who created the job can delete it
      if (currentJob.clientId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Nu ai permisiunea să ștergi acest job',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Only allow deletion if job is not in progress or completed
      if (currentJob.status === 'IN_PROGRESS' || currentJob.status === 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'Nu poți șterge un job care este în curs sau finalizat',
          code: 'JOB_CANNOT_BE_DELETED',
        });
      }

      await databaseService.deleteJob(id);

      logger.info(`Job deleted: ${id} by ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Job șters cu succes!',
      });
    } catch (error) {
      logger.error('Delete job error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la ștergerea job-ului',
        code: 'JOB_DELETION_ERROR',
      });
    }
  },

  async applyForJob(req: Request, res: Response) {
    try {
      const professionalId = req.user?.id;
      if (!professionalId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { id: jobId } = req.params;
      const { proposal, price, currency = 'RON', estimatedTime } = req.body;

      // Validate required fields
      if (!proposal || !price || !estimatedTime) {
        return res.status(400).json({
          success: false,
          message: 'Toate câmpurile obligatorii trebuie completate',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      // Check if job exists and is active
      const job = await databaseService.findJobById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      if (job.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Nu poți aplica pentru un job care nu este activ',
          code: 'JOB_NOT_ACTIVE',
        });
      }

      // Check if professional already applied
      const existingApplication = await databaseService.findJobApplication(jobId, professionalId);
      if (existingApplication) {
        return res.status(409).json({
          success: false,
          message: 'Ai aplicat deja pentru acest job',
          code: 'ALREADY_APPLIED',
        });
      }

      // Create application
      const application = await databaseService.createJobApplication({
        jobId,
        professionalId,
        proposal,
        price: parseFloat(price),
        currency,
        estimatedTime,
      });

      logger.info(`Job application created: ${application.id} for job ${jobId}`);

      return res.status(201).json({
        success: true,
        message: 'Aplicația a fost trimisă cu succes!',
        data: { application },
      });
    } catch (error) {
      logger.error('Apply for job error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la trimiterea aplicației',
        code: 'APPLICATION_ERROR',
      });
    }
  },

  async getJobApplications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { jobId } = req.params;

      // Check if job exists and user has access
      const job = await databaseService.findJobById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      // Only client who created the job or assigned professional can see applications
      if (job.clientId !== userId && job.professionalId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Nu ai permisiunea să vezi aplicațiile pentru acest job',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const applications = await databaseService.findJobApplications(jobId);

      return res.status(200).json({
        success: true,
        data: { applications },
      });
    } catch (error) {
      logger.error('Get job applications error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea aplicațiilor',
        code: 'APPLICATIONS_FETCH_ERROR',
      });
    }
  },
};
