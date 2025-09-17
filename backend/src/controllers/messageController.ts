import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { databaseService } from '../services/databaseService';
import { logger } from '../utils/logger';
import { emitNewMessage, emitToJob } from '../services/socketService';

// Global Socket.IO instance (will be set by the main server)
let io: Server;

export const setSocketIO = (socketIO: Server) => {
  io = socketIO;
};

export const messageController = {
  // Get messages for a job
  async getMessages(req: Request, res: Response) {
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
      const { limit = '50', offset = '0' } = req.query;

      // Check if user has access to this job
      const job = await databaseService.findJobById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      // Only client or assigned professional can see messages
      if (job.clientId !== userId && job.professionalId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Nu ai permisiunea să vezi mesajele pentru acest job',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      const { messages, total } = await databaseService.findMessages(jobId, parseInt(limit as string), parseInt(offset as string));

      return res.status(200).json({
        success: true,
        data: {
          messages,
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      logger.error('Get messages error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea mesajelor',
        code: 'MESSAGES_FETCH_ERROR',
      });
    }
  },

  // Send a message
  async sendMessage(req: Request, res: Response) {
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
      const { content, messageType = 'TEXT' } = req.body;

      // Validate required fields
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Conținutul mesajului este obligatoriu',
          code: 'MISSING_CONTENT',
        });
      }

      // Check if job exists and user has access
      const job = await databaseService.findJobById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      // Only client or assigned professional can send messages
      if (job.clientId !== userId && job.professionalId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Nu ai permisiunea să trimiți mesaje pentru acest job',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Determine recipient
      const recipientId = job.clientId === userId ? job.professionalId : job.clientId;
      if (!recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Nu există un destinatar pentru acest job',
          code: 'NO_RECIPIENT',
        });
      }

      // Create message
      const message = await databaseService.createMessage({
        jobId,
        senderId: userId,
        recipientId,
        content: content.trim(),
        messageType,
      });

      // Emit real-time message via Socket.IO
      if (io) {
        // Emit to the recipient
        emitNewMessage(io, recipientId, {
          id: message.id,
          jobId: message.jobId,
          senderId: message.senderId,
          content: message.content,
          messageType: message.messageType,
          createdAt: message.createdAt,
          sender: {
            id: userId,
            name: req.user?.name || 'Unknown',
          }
        });

        // Emit to job room for real-time updates
        emitToJob(io, jobId, 'new-message', {
          id: message.id,
          jobId: message.jobId,
          senderId: message.senderId,
          recipientId: message.recipientId,
          content: message.content,
          messageType: message.messageType,
          createdAt: message.createdAt,
        });

        logger.info(`Real-time message emitted: ${message.id} for job ${jobId}`);
      }

      logger.info(`Message sent: ${message.id} for job ${jobId}`);

      return res.status(201).json({
        success: true,
        message: 'Mesajul a fost trimis cu succes!',
        data: { message },
      });
    } catch (error) {
      logger.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la trimiterea mesajului',
        code: 'MESSAGE_SEND_ERROR',
      });
    }
  },

  // Mark messages as read
  async markAsRead(req: Request, res: Response) {
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
      const { messageIds } = req.body;

      if (!messageIds || !Array.isArray(messageIds)) {
        return res.status(400).json({
          success: false,
          message: 'ID-urile mesajelor sunt obligatorii',
          code: 'MISSING_MESSAGE_IDS',
        });
      }

      // Check if user has access to this job
      const job = await databaseService.findJobById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job-ul nu a fost găsit',
          code: 'JOB_NOT_FOUND',
        });
      }

      // Only client or assigned professional can mark messages as read
      if (job.clientId !== userId && job.professionalId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Nu ai permisiunea să marchezi mesajele ca citite pentru acest job',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }

      // Mark messages as read
      await databaseService.markMessagesAsRead(messageIds, userId);

      logger.info(`Messages marked as read: ${messageIds.length} messages for user ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Mesajele au fost marcate ca citite!',
      });
    } catch (error) {
      logger.error('Mark messages as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la marcarea mesajelor ca citite',
        code: 'MARK_READ_ERROR',
      });
    }
  },

  // Get user's conversations
  async getConversations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Utilizator neautentificat',
          code: 'UNAUTHORIZED',
        });
      }

      const { limit = '20', offset = '0' } = req.query;

      const conversations = await databaseService.findUserConversations(userId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      return res.status(200).json({
        success: true,
        data: {
          conversations,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      logger.error('Get conversations error:', error);
      return res.status(500).json({
        success: false,
        message: 'A apărut o eroare la obținerea conversațiilor',
        code: 'CONVERSATIONS_FETCH_ERROR',
      });
    }
  },
};
