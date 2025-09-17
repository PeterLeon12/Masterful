import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient;

export const connectDatabase = async (): Promise<void> => {
  try {
    // Create Prisma client instance
    prisma = new PrismaClient({
      log: process.env["NODE_ENV"] === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });

    // Test the connection
    await prisma.$connect();
    
    logger.info('✅ Database connected successfully');
    
    // Handle graceful shutdown
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    });
    
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return prisma;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  }
};

// Health check for database
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!prisma) {
      logger.error('Database not connected. Call connectDatabase() first.');
      return false;
    }
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

// Export prisma instance for direct use
export { prisma };
