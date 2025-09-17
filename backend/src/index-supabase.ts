import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { supabaseService } from './services/supabaseService';
import { logger } from './utils/logger';

// Import controllers
import { supabaseAuthController } from './controllers/supabaseAuthController';
import { supabaseJobController } from './controllers/supabaseJobController';

// Import middleware
import { supabaseAuth, requireRole } from './middleware/supabaseAuth';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env['FRONTEND_URL'] || "http://localhost:8081",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env['PORT'] || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env['FRONTEND_URL'] || "http://localhost:8081",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Prea multe cereri de la această adresă IP',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Prea multe încercări de autentificare',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const isHealthy = await supabaseService.healthCheck();
    
    res.json({
      status: isHealthy ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development',
      version: '1.0.0',
      database: isHealthy ? 'connected' : 'disconnected',
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
      }
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// API Routes
app.use('/api/auth', authLimiter);

// Authentication routes
app.post('/api/auth/register', supabaseAuthController.register);
app.post('/api/auth/login', supabaseAuthController.login);
app.post('/api/auth/logout', supabaseAuthController.logout);
app.post('/api/auth/refresh', supabaseAuthController.refreshToken);
app.post('/api/auth/forgot-password', supabaseAuthController.forgotPassword);
app.post('/api/auth/reset-password', supabaseAuthController.resetPassword);

// Protected routes
app.use('/api/user', supabaseAuth);
app.get('/api/user/profile', supabaseAuthController.getProfile);
app.put('/api/user/profile', supabaseAuthController.updateProfile);
app.delete('/api/user/account', supabaseAuthController.deleteAccount);

// Job routes
app.use('/api/jobs', supabaseAuth);
app.post('/api/jobs', supabaseJobController.createJob);
app.get('/api/jobs', supabaseJobController.getJobs);
app.get('/api/jobs/:id', supabaseJobController.getJobById);
app.put('/api/jobs/:id', supabaseJobController.updateJob);
app.delete('/api/jobs/:id', supabaseJobController.deleteJob);
app.post('/api/jobs/:id/apply', requireRole(['PROFESSIONAL']), supabaseJobController.applyToJob);
app.get('/api/jobs/:id/applications', supabaseJobController.getJobApplications);

// Socket.IO for real-time messaging
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-job', (jobId: string) => {
    socket.join(`job-${jobId}`);
    logger.info(`Client ${socket.id} joined job ${jobId}`);
  });

  socket.on('leave-job', (jobId: string) => {
    socket.leave(`job-${jobId}`);
    logger.info(`Client ${socket.id} left job ${jobId}`);
  });

  socket.on('send-message', async (data: {
    jobId: string;
    recipientId: string;
    content: string;
    messageType?: string;
  }) => {
    try {
      // Create message in database
      const message = await supabaseService.createMessage({
        sender_id: data.recipientId, // This should be the actual sender ID
        recipient_id: data.recipientId,
        job_id: data.jobId,
        content: data.content,
        message_type: data.messageType || 'TEXT',
      });

      // Emit to all clients in the job room
      io.to(`job-${data.jobId}`).emit('new-message', message);
    } catch (error) {
      logger.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'A apărut o eroare internă',
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta nu a fost găsită',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔗 Frontend URL: ${process.env['FRONTEND_URL'] || 'http://localhost:8081'}`);
  logger.info(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;
