import { Request, Response } from 'express';
import { databaseService } from '../services/databaseService';
import { logger } from '../utils/logger';

export const userController = {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const user = await databaseService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizatorul nu a fost găsit',
          code: 'USER_NOT_FOUND',
        });
      }

      // Get additional profile data based on role
      let profileData: any = { user };
      
      if (user.role === 'PROFESSIONAL') {
        const professional = await databaseService.findProfessionalByUserId(userId);
        profileData.professional = professional;
      } else if (user.role === 'CLIENT') {
        const client = await databaseService.findClientByUserId(userId);
        profileData.client = client;
      }

      return res.status(200).json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la încărcarea profilului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { name, phone, avatar } = req.body;

      // Validate input
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Numele trebuie să aibă cel puțin 2 caractere',
          code: 'INVALID_NAME',
        });
      }

      // Update user profile
      const updatedUser = await databaseService.updateUser(userId, {
        name: name.trim(),
        phone,
        avatar,
      });

      logger.info(`Profile updated for user: ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Profilul a fost actualizat cu succes',
        data: { user: updatedUser },
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la actualizarea profilului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      // Get user data before deletion
      const user = await databaseService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizatorul nu a fost găsit',
          code: 'USER_NOT_FOUND',
        });
      }

      // Soft delete user account by setting isActive to false
      await databaseService.updateUser(userId, {
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`,
        name: 'Utilizator șters',
        phone: null,
        avatar: null,
      });

      // TODO: Implement additional cleanup:
      // - Anonymize personal data in related tables
      // - Handle job data (cancel active jobs, anonymize completed ones)
      // - Handle message data (anonymize sender names)
      // - Send confirmation email
      // - Log deletion for audit purposes

      logger.info(`Account soft deleted for user: ${userId} (${user.email})`);

      return res.status(200).json({
        success: true,
        message: 'Contul a fost șters cu succes',
      });
    } catch (error) {
      logger.error('Delete account error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la ștergerea contului',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const notifications = await databaseService.findUserNotifications(userId, {
        limit: Number(limit),
        offset,
      });

      return res.status(200).json({
        success: true,
        data: { notifications },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          hasMore: notifications.length === Number(limit),
        },
      });
    } catch (error) {
      logger.error('Get notifications error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la încărcarea notificărilor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async markNotificationAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      await databaseService.markNotificationAsRead(notificationId, userId);

      return res.status(200).json({
        success: true,
        message: 'Notificarea a fost marcată ca citită',
      });
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la marcarea notificării',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const user = await databaseService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizatorul nu a fost găsit',
          code: 'USER_NOT_FOUND',
        });
      }

      let stats: any = {};

      if (user.role === 'CLIENT') {
        const clientStats = await databaseService.getClientStats(userId);
        stats = clientStats || {};
      } else if (user.role === 'PROFESSIONAL') {
        const professionalStats = await databaseService.getProfessionalStats(userId);
        stats = professionalStats || {};
      }

      return res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la încărcarea statisticilor',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};
