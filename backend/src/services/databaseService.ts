import { PrismaClient, User, Job, Professional, Client, Profile, JobApplication, Review, Message, Payment, Subscription, Notification } from '@prisma/client';
import { logger } from '../utils/logger';

// Extend PrismaClient with custom methods
class DatabaseService extends PrismaClient {
  constructor() {
    super({
      log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'info', 'warn'] : ['error'],
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }


  // User operations
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role?: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
    phone?: string;
  }): Promise<User> {
    try {
      const user = await this.user.create({
        data: userData,
      });
      logger.info(`User created: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.user.findUnique({
        where: { email },
        include: {
          profile: true,
          professional: true,
          client: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find user by email:', error);
      throw error;
    }
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      return await this.user.findUnique({
        where: { id },
        include: {
          profile: true,
          professional: true,
          client: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find user by ID:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const user = await this.user.update({
        where: { id },
        data,
      });
      logger.info(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Failed to update user:', error);
      throw error;
    }
  }

  // Job operations
  async createJob(jobData: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    location: string;
    budget: string;
    clientId: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    scheduledAt?: Date | undefined;
  }): Promise<Job> {
    try {
      const createData: any = {
        title: jobData.title,
        description: jobData.description,
        category: jobData.category,
        location: jobData.location,
        budget: jobData.budget,
        clientId: jobData.clientId,
      };

      if (jobData.subcategory) createData.subcategory = jobData.subcategory;
      if (jobData.priority) createData.priority = jobData.priority;
      if (jobData.scheduledAt) createData.scheduledAt = jobData.scheduledAt;

      const job = await this.job.create({
        data: createData,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      logger.info(`Job created: ${job.title} by ${job.clientId}`);
      return job;
    } catch (error) {
      logger.error('Failed to create job:', error);
      throw error;
    }
  }

  async findJobs(filters: {
    category?: string;
    location?: string;
    status?: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    clientId?: string;
    professionalId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ jobs: Job[]; total: number }> {
    try {
      const where: any = {};
      
      if (filters.category) where.category = filters.category;
      if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
      if (filters.status) where.status = filters.status;
      if (filters.clientId) where.clientId = filters.clientId;
      if (filters.professionalId) where.professionalId = filters.professionalId;

      const [jobs, total] = await Promise.all([
        this.job.findMany({
          where,
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            professional: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            applications: {
              include: {
                professional: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: filters.limit || 20,
          skip: filters.offset || 0,
        }),
        this.job.count({ where }),
      ]);

      return { jobs, total };
    } catch (error) {
      logger.error('Failed to find jobs:', error);
      throw error;
    }
  }

  async findJobById(id: string): Promise<Job | null> {
    try {
      return await this.job.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          applications: {
            include: {
              professional: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to find job by ID:', error);
      throw error;
    }
  }

  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    try {
      const job = await this.job.update({
        where: { id },
        data,
      });
      logger.info(`Job updated: ${job.title}`);
      return job;
    } catch (error) {
      logger.error('Failed to update job:', error);
      throw error;
    }
  }

  async deleteJob(id: string): Promise<void> {
    try {
      await this.job.delete({
        where: { id },
      });
      logger.info(`Job deleted: ${id}`);
    } catch (error) {
      logger.error('Failed to delete job:', error);
      throw error;
    }
  }

  // Professional operations
  async createProfessional(professionalData: {
    userId: string;
    categories: string;
    hourlyRate: number;
    currency?: string;
    experience: number;
    bio?: string;
    portfolio?: string;
    certifications?: string;
    insurance?: boolean;
    workingHours?: string;
    serviceAreas?: string;
  }): Promise<Professional> {
    try {
      const professional = await this.professional.create({
        data: {
          ...professionalData,
          portfolio: professionalData.portfolio || '',
          certifications: professionalData.certifications || '',
          serviceAreas: professionalData.serviceAreas || '',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
      });
      logger.info(`Professional profile created for user: ${professional.userId}`);
      return professional;
    } catch (error) {
      logger.error('Failed to create professional profile:', error);
      throw error;
    }
  }

  async findProfessionals(filters: {
    categories?: string[];
    location?: string;
    minRating?: number;
    maxHourlyRate?: number;
    isAvailable?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ professionals: Professional[]; total: number }> {
    try {
      const where: any = {};
      
      if (filters.categories && filters.categories.length > 0) {
        where.categories = { contains: filters.categories.join(','), mode: 'insensitive' };
      }
      if (filters.minRating) where.rating = { gte: filters.minRating };
      if (filters.maxHourlyRate) where.hourlyRate = { lte: filters.maxHourlyRate };
      if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable;

      const [professionals, total] = await Promise.all([
        this.professional.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
          orderBy: { rating: 'desc' },
          take: filters.limit || 20,
          skip: filters.offset || 0,
        }),
        this.professional.count({ where }),
      ]);

      return { professionals, total };
    } catch (error) {
      logger.error('Failed to find professionals:', error);
      throw error;
    }
  }

  // Job Application operations
  async createJobApplication(applicationData: {
    jobId: string;
    professionalId: string;
    proposal: string;
    price: number;
    currency?: string;
    estimatedTime: string;
  }): Promise<JobApplication> {
    try {
      const application = await this.jobApplication.create({
        data: applicationData,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              client: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      logger.info(`Job application created: ${application.id}`);
      return application;
    } catch (error) {
      logger.error('Failed to create job application:', error);
      throw error;
    }
  }

  async findJobApplication(jobId: string, professionalId: string): Promise<JobApplication | null> {
    try {
      return await this.jobApplication.findUnique({
        where: {
          jobId_professionalId: {
            jobId,
            professionalId,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to find job application:', error);
      throw error;
    }
  }

  async findJobApplications(jobId: string): Promise<JobApplication[]> {
    try {
      return await this.jobApplication.findMany({
        where: { jobId },
        include: {
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to find job applications:', error);
      throw error;
    }
  }

  // Review operations
  async createReview(reviewData: {
    jobId: string;
    authorId: string;
    recipientId: string;
    rating: number;
    comment?: string;
    isPublic?: boolean;
  }): Promise<Review> {
    try {
      const review = await this.review.create({
        data: reviewData,
        include: {
          job: {
            select: {
              id: true,
              title: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          recipient: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update professional rating
      if (review.recipientId) {
        await this.updateProfessionalRating(review.recipientId);
      }

      logger.info(`Review created: ${review.id}`);
      return review;
    } catch (error) {
      logger.error('Failed to create review:', error);
      throw error;
    }
  }

  private async updateProfessionalRating(professionalId: string): Promise<void> {
    try {
      const reviews = await this.review.findMany({
        where: { recipientId: professionalId },
        select: { rating: true },
      });

      if (reviews.length > 0) {
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        
        await this.professional.update({
          where: { userId: professionalId },
          data: {
            rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            reviewCount: reviews.length,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to update professional rating:', error);
    }
  }

  // Message operations
  async createMessage(messageData: {
    jobId: string;
    senderId: string;
    recipientId: string;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION';
  }): Promise<Message> {
    try {
      const message = await this.message.create({
        data: messageData,
        include: {
          job: {
            select: {
              id: true,
              title: true,
            },
          },
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
          recipient: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      logger.info(`Message created: ${message.id}`);
      return message;
    } catch (error) {
      logger.error('Failed to create message:', error);
      throw error;
    }
  }

  async findMessages(jobId: string, limit?: number, offset?: number): Promise<{ messages: Message[]; total: number }> {
    try {
      const [messages, total] = await Promise.all([
        this.message.findMany({
          where: { jobId },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            recipient: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: limit || 50,
          skip: offset || 0,
        }),
        this.message.count({ where: { jobId } }),
      ]);

      return { messages, total };
    } catch (error) {
      logger.error('Failed to find messages:', error);
      throw error;
    }
  }

  // Additional Professional operations
  async findProfessionalById(id: string): Promise<Professional | null> {
    try {
      return await this.professional.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to find professional by ID:', error);
      throw error;
    }
  }

  async findProfessionalByUserId(userId: string): Promise<Professional | null> {
    try {
      return await this.professional.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to find professional by user ID:', error);
      throw error;
    }
  }

  async updateProfessional(id: string, data: Partial<Professional>): Promise<Professional> {
    try {
      const professional = await this.professional.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
      });
      logger.info(`Professional updated: ${professional.id}`);
      return professional;
    } catch (error) {
      logger.error('Failed to update professional:', error);
      throw error;
    }
  }

  // Professional Applications
  async findProfessionalApplications(professionalId: string, filters: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<JobApplication[]> {
    try {
      const where: any = { professionalId };
      if (filters.status) where.status = filters.status;

      return await this.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
      });
    } catch (error) {
      logger.error('Failed to find professional applications:', error);
      throw error;
    }
  }

  // Professional Reviews
  async findProfessionalReviews(professionalId: string, filters: {
    limit?: number;
    offset?: number;
  }): Promise<Review[]> {
    try {
      return await this.review.findMany({
        where: { recipientId: professionalId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
      });
    } catch (error) {
      logger.error('Failed to find professional reviews:', error);
      throw error;
    }
  }

  // Additional Message operations
  async markMessagesAsRead(messageIds: string[], userId: string): Promise<void> {
    try {
      await this.message.updateMany({
        where: {
          id: { in: messageIds },
          recipientId: userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      logger.info(`Messages marked as read: ${messageIds.length} messages for user ${userId}`);
    } catch (error) {
      logger.error('Failed to mark messages as read:', error);
      throw error;
    }
  }

  async findUserConversations(userId: string, filters: {
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      // Get jobs where user is either client or professional
      const jobs = await this.job.findMany({
        where: {
          OR: [
            { clientId: userId },
            { professionalId: userId },
          ],
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  recipientId: userId,
                  isRead: false,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
      });

      // Transform to conversation format
      return jobs.map(job => ({
        jobId: job.id,
        jobTitle: job.title,
        jobStatus: job.status,
        otherUser: job.clientId === userId ? job.professional : job.client,
        lastMessage: job.messages[0] || null,
        unreadCount: job._count.messages,
        updatedAt: job.updatedAt,
      }));
    } catch (error) {
      logger.error('Failed to find user conversations:', error);
      throw error;
    }
  }

  // User-related methods
  async findClientByUserId(userId: string) {
    try {
      return await this.client.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to find client by user ID:', error);
      throw error;
    }
  }

  async findUserNotifications(userId: string, options: { limit: number; offset: number }) {
    try {
      return await this.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: options.limit,
        skip: options.offset,
      });
    } catch (error) {
      logger.error('Failed to find user notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    try {
      await this.notification.update({
        where: { 
          id: notificationId,
          userId, // Ensure user can only mark their own notifications
        },
        data: { isRead: true },
      });
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async getClientStats(userId: string) {
    try {
      const client = await this.client.findUnique({
        where: { userId },
      });

      if (!client) return null;

      // Get job counts using separate queries
      const jobCounts = await this.job.groupBy({
        by: ['status'],
        where: { clientId: userId },
        _count: { status: true },
      });

      const totalJobs = jobCounts.reduce((sum, count) => sum + count._count.status, 0);
      const activeJobs = jobCounts.find(c => c.status === 'ACTIVE')?._count.status || 0;
      const completedJobs = jobCounts.find(c => c.status === 'COMPLETED')?._count.status || 0;

      const stats = {
        totalJobs,
        activeJobs,
        completedJobs,
        totalSpent: client.totalSpent,
      };

      return stats;
    } catch (error) {
      logger.error('Failed to get client stats:', error);
      throw error;
    }
  }

  async getProfessionalStats(userId: string) {
    try {
      const professional = await this.professional.findUnique({
        where: { userId },
      });

      if (!professional) return null;

      // Get application counts using separate queries
      const applicationCounts = await this.jobApplication.groupBy({
        by: ['status'],
        where: { professionalId: userId },
        _count: { status: true },
      });

      const totalApplications = applicationCounts.reduce((sum, count) => sum + count._count.status, 0);
      const acceptedApplications = applicationCounts.find(c => c.status === 'ACCEPTED')?._count.status || 0;
      const completedJobs = applicationCounts.find(c => c.status === 'ACCEPTED')?._count.status || 0; // Assuming accepted = completed for now

      // Get review count
      const reviewCount = await this.review.count({
        where: { recipientId: userId },
      });

      const stats = {
        totalApplications,
        acceptedApplications,
        completedJobs,
        totalEarnings: professional.totalEarnings,
        rating: professional.rating,
        reviewCount,
      };

      return stats;
    } catch (error) {
      logger.error('Failed to get professional stats:', error);
      throw error;
    }
  }

  // Payment-related methods
  async createPayment(paymentData: {
    jobId: string;
    clientId: string;
    professionalId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    stripePaymentIntentId: string;
  }) {
    try {
      const payment = await this.payment.create({
        data: {
          ...paymentData,
          status: paymentData.status as any,
          paymentMethod: paymentData.paymentMethod as any,
        },
      });
      logger.info(`Payment created: ${payment.id}`);
      return payment;
    } catch (error) {
      logger.error('Failed to create payment:', error);
      throw error;
    }
  }

  async findPaymentByStripeId(stripePaymentIntentId: string) {
    try {
      return await this.payment.findUnique({
        where: { stripePaymentIntentId },
        include: {
          job: true,
          client: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find payment by Stripe ID:', error);
      throw error;
    }
  }

  async findPaymentByJobId(jobId: string) {
    try {
      return await this.payment.findFirst({
        where: { jobId },
        include: {
          job: true,
          client: true,
        },
      });
    } catch (error) {
      logger.error('Failed to find payment by job ID:', error);
      throw error;
    }
  }

  async updatePayment(id: string, data: Partial<any>) {
    try {
      const payment = await this.payment.update({
        where: { id },
        data,
      });
      logger.info(`Payment updated: ${payment.id}`);
      return payment;
    } catch (error) {
      logger.error('Failed to update payment:', error);
      throw error;
    }
  }

  async updatePaymentByStripeId(stripePaymentIntentId: string, data: Partial<any>) {
    try {
      const payment = await this.payment.update({
        where: { stripePaymentIntentId },
        data,
      });
      logger.info(`Payment updated by Stripe ID: ${payment.id}`);
      return payment;
    } catch (error) {
      logger.error('Failed to update payment by Stripe ID:', error);
      throw error;
    }
  }

  async findUserPayments(userId: string, options: { limit: number; offset: number }) {
    try {
      return await this.payment.findMany({
        where: {
          OR: [
            { clientId: userId },
            { 
              job: {
                professionalId: userId
              }
            }
          ]
        },
        include: {
          job: {
            include: {
              client: true,
              professional: true,
            }
          },
          client: true,
        },
        orderBy: { createdAt: 'desc' },
        take: options.limit,
        skip: options.offset,
      });
    } catch (error) {
      logger.error('Failed to find user payments:', error);
      throw error;
    }
  }

  // Cleanup and maintenance
  async cleanup(): Promise<void> {
    try {
      await this.$disconnect();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Failed to close database connection:', error);
    }
  }
}

// Create singleton instance
export const databaseService = new DatabaseService();

// Export types for use in other parts of the application
export type {
  User,
  Job,
  Professional,
  Client,
  Profile,
  JobApplication,
  Review,
  Message,
  Payment,
  Subscription,
  Notification,
};
