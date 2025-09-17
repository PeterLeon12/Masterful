import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import * as jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupSocketIO = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth['token'] || socket.handshake.headers.authorization;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      
      const decoded = jwt.verify(cleanToken, process.env["JWT_SECRET"]!) as any;
      
      if (!decoded || !decoded.userId) {
        return next(new Error('Invalid token'));
      }

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;
    
    logger.info(`User connected: ${userId} (${userRole})`);

    // Emit authentication success
    socket.emit('auth-success', {
      userId,
      userRole,
      message: 'Authentication successful'
    });

    // Join user to their personal room
    if (userId) {
      socket.join(`user:${userId}`);
      
      // Join role-specific rooms
      if (userRole === 'PROFESSIONAL') {
        socket.join('professionals');
      } else if (userRole === 'CLIENT') {
        socket.join('clients');
      }
    }

    // Handle job updates
    socket.on('join-job', (jobId: string) => {
      if (userId) {
        socket.join(`job:${jobId}`);
        logger.info(`User ${userId} joined job room: ${jobId}`);
        
        // Emit confirmation
        socket.emit('job-joined', {
          jobId,
          userId,
          message: `Successfully joined job room: ${jobId}`
        });
      }
    });

    socket.on('leave-job', (jobId: string) => {
      if (userId) {
        socket.leave(`job:${jobId}`);
        logger.info(`User ${userId} left job room: ${jobId}`);
      }
    });

    // Handle private messages
    socket.on('private-message', (data: {
      recipientId: string;
      message: string;
      jobId: string;
    }) => {
      if (userId) {
        // Emit to recipient's personal room
        io.to(`user:${data.recipientId}`).emit('new-message', {
          senderId: userId,
          message: data.message,
          jobId: data.jobId,
          timestamp: new Date().toISOString()
        });
        
        // Emit back to sender for confirmation
        socket.emit('message-sent', {
          recipientId: data.recipientId,
          message: data.message,
          jobId: data.jobId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data: { recipientId: string; jobId: string }) => {
      if (userId) {
        io.to(`user:${data.recipientId}`).emit('user-typing', {
          userId,
          jobId: data.jobId,
          isTyping: true
        });
      }
    });

    socket.on('typing-stop', (data: { recipientId: string; jobId: string }) => {
      if (userId) {
        io.to(`user:${data.recipientId}`).emit('user-typing', {
          userId,
          jobId: data.jobId,
          isTyping: false
        });
      }
    });

    // Handle online status
    socket.on('set-online-status', (status: boolean) => {
      if (userId) {
        // Broadcast to relevant users
        if (userRole === 'PROFESSIONAL') {
          io.to('clients').emit('professional-status-change', {
            userId,
            isOnline: status
          });
        }
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
      
      // Broadcast offline status
      if (userId && userRole === 'PROFESSIONAL') {
        io.to('clients').emit('professional-status-change', {
          userId,
          isOnline: false
        });
      }
    });
  });

  logger.info('Socket.IO service initialized');
};

// Utility functions for emitting events from other parts of the app
export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToJob = (io: Server, jobId: string, event: string, data: any) => {
  io.to(`job:${jobId}`).emit(event, data);
};

export const emitToRole = (io: Server, role: string, event: string, data: any) => {
  io.to(role.toLowerCase() + 's').emit(event, data);
};

export const emitToAll = (io: Server, event: string, data: any) => {
  io.emit(event, data);
};

// Job-related events
export const emitJobUpdate = (io: Server, jobId: string, jobData: any) => {
  emitToJob(io, jobId, 'job-updated', jobData);
};

export const emitJobApplication = (io: Server, jobId: string, applicationData: any) => {
  emitToJob(io, jobId, 'new-application', applicationData);
};

export const emitJobStatusChange = (io: Server, jobId: string, statusData: any) => {
  emitToJob(io, jobId, 'job-status-changed', statusData);
};

// Message-related events
export const emitNewMessage = (io: Server, recipientId: string, messageData: any) => {
  emitToUser(io, recipientId, 'new-message', messageData);
};

// Notification events
export const emitNotification = (io: Server, userId: string, notificationData: any) => {
  emitToUser(io, userId, 'new-notification', notificationData);
};

// Payment events
export const emitPaymentUpdate = (io: Server, userId: string, paymentData: any) => {
  emitToUser(io, userId, 'payment-updated', paymentData);
};
