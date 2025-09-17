import { Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService';
import { logger } from '../utils/logger';

export const supabaseJobController = {
  async createJob(req: Request, res: Response) {
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
        title,
        description,
        category,
        location,
        budget_min,
        budget_max,
        deadline,
        requirements,
        images = [],
      } = req.body;

      // Validate required fields
      if (!title || !description || !category || !location) {
        return res.status(400).json({
          success: false,
          message: 'Titlul, descrierea, categoria și locația sunt obligatorii',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      // Create job
      const job = await supabaseService.createJob({
        client_id: userId,
        title,
        description,
        category,
        location,
        ...(budget_min && { budget_min: parseFloat(budget_min) }),
        ...(budget_max && { budget_max: parseFloat(budget_max) }),
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        requirements,
        images,
        status: 'OPEN',
      });

      logger.info(`Job created: ${job.id} by user: ${userId}`);

      return res.status(201).json({
        success: true,
        message: 'Job creat cu succes',
        data: { job },
      });
    } catch (error) {
      logger.error('Create job error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la crearea job-ului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async getJobs(req: Request, res: Response) {
    try {
      const {
        category,
        location,
        status = 'OPEN',
        limit = 20,
        offset = 0,
      } = req.query;

      const filters: any = {
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      if (category) filters.category = category as string;
      if (location) filters.location = location as string;

      const jobs = await supabaseService.getJobs(filters);

      return res.status(200).json({
        success: true,
        data: { jobs },
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: jobs.length,
        },
      });
    } catch (error) {
      logger.error('Get jobs error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea job-urilor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async getJobById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID-ul job-ului este obligatoriu',
          code: 'MISSING_JOB_ID',
        });
      }

      const job = await supabaseService.findJobById(id);

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
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async updateJob(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID-ul job-ului este obligatoriu',
          code: 'MISSING_JOB_ID',
        });
      }

      // Check if job exists and user owns it
      const existingJob = await supabaseService.findJobById(id);
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      if (existingJob.client_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Nu aveți permisiunea să actualizați acest job',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const updates = req.body;
      delete updates.id; // Prevent ID changes
      delete updates.client_id; // Prevent client changes
      delete updates.created_at; // Prevent creation date changes

      // Update job
      const { data, error } = await supabaseService.client
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info(`Job updated: ${id} by user: ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Job actualizat cu succes',
        data: { job: data },
      });
    } catch (error) {
      logger.error('Update job error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la actualizarea job-ului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async deleteJob(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID-ul job-ului este obligatoriu',
          code: 'MISSING_JOB_ID',
        });
      }

      // Check if job exists and user owns it
      const existingJob = await supabaseService.findJobById(id);
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      if (existingJob.client_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Nu aveți permisiunea să ștergeți acest job',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Delete job (this will cascade delete applications and messages)
      const { error } = await supabaseService.client
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      logger.info(`Job deleted: ${id} by user: ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Job șters cu succes',
      });
    } catch (error) {
      logger.error('Delete job error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la ștergerea job-ului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async applyToJob(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { cover_letter, proposed_rate, estimated_duration } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID-ul job-ului este obligatoriu',
          code: 'MISSING_JOB_ID',
        });
      }

      // Check if user is a professional
      const user = await supabaseService.findUserById(userId);
      if (!user || user.role !== 'PROFESSIONAL') {
        return res.status(403).json({
          success: false,
          message: 'Doar profesioniștii pot aplica la job-uri',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Check if job exists
      const job = await supabaseService.findJobById(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      // Check if job is open
      if (job.status !== 'OPEN') {
        return res.status(400).json({
          success: false,
          message: 'Job-ul nu mai acceptă aplicații',
          code: 'JOB_NOT_OPEN',
        });
      }

      // Check if user already applied
      const { data: existingApplication } = await supabaseService.client
        .from('job_applications')
        .select('id')
        .eq('job_id', id)
        .eq('professional_id', userId)
        .single();

      if (existingApplication) {
        return res.status(409).json({
          success: false,
          message: 'Ați aplicat deja la acest job',
          code: 'ALREADY_APPLIED',
        });
      }

      // Create application
      const { data: application, error } = await supabaseService.client
        .from('job_applications')
        .insert({
          job_id: id,
          professional_id: userId,
          cover_letter,
          proposed_rate: proposed_rate ? parseFloat(proposed_rate) : undefined,
          estimated_duration,
          status: 'PENDING',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info(`Job application created: ${application.id} for job: ${id} by user: ${userId}`);

      return res.status(201).json({
        success: true,
        message: 'Aplicația a fost trimisă cu succes',
        data: { application },
      });
    } catch (error) {
      logger.error('Apply to job error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la aplicarea la job',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async getJobApplications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID-ul job-ului este obligatoriu',
          code: 'MISSING_JOB_ID',
        });
      }

      // Check if job exists and user owns it
      const job = await supabaseService.findJobById(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      if (job.client_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Nu aveți permisiunea să vedeți aplicațiile pentru acest job',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Get applications
      const { data: applications, error } = await supabaseService.client
        .from('job_applications')
        .select(`
          *,
          professional:users!job_applications_professional_id_fkey(*),
          professional_profile:professionals!job_applications_professional_id_fkey(*)
        `)
        .eq('job_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: { applications: applications || [] },
      });
    } catch (error) {
      logger.error('Get job applications error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea aplicațiilor',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
