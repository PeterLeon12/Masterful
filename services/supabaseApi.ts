import { supabase } from './supabaseRealtimeService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  token?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location: string; // JSON string
  status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  clientId: string;
  professionalId?: string;
  scheduledAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  professional?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Professional {
  id: string;
  userId: string;
  categories: string; // Comma-separated string
  hourlyRate: number;
  currency: string;
  rating: number;
  reviewCount: number;
  totalEarnings: number;
  isVerified: boolean;
  isAvailable: boolean;
  experience: number;
  bio?: string;
  portfolio: string; // Comma-separated URLs
  certifications: string; // Comma-separated URLs
  insurance: boolean;
  workingHours?: string; // JSON string
  serviceAreas: string; // Comma-separated areas
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export interface Message {
  id: string;
  job_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  recipient?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface JobApplication {
  id: string;
  job_id: string;
  professional_id: string;
  proposal: string;
  price: number;
  estimated_time: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  created_at: string;
  updated_at: string;
  professional?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  professional_profile?: {
    id: string;
    hourly_rate: number;
    rating: number;
    review_count: number;
    bio?: string;
    categories: string;
  };
}

// Supabase API Client
class SupabaseApiClient {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  private async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      console.log('Supabase login attempt for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: 'Login failed: No user or session data',
        };
      }

      // Get user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // If user doesn't exist in users table, create them
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            role: 'CLIENT',
            is_active: true,
            is_verified: data.user.email_confirmed_at ? true : false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          return {
            success: false,
            error: 'Failed to create user profile',
          };
        }

        const user: User = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          phone: newUser.phone,
          avatar: newUser.avatar,
          isActive: newUser.is_active,
          isVerified: newUser.is_verified,
          emailVerifiedAt: newUser.email_verified_at,
          phoneVerifiedAt: newUser.phone_verified_at,
          lastLoginAt: newUser.last_login_at,
          createdAt: newUser.created_at,
          updatedAt: newUser.updated_at,
        };

        await this.setAuthToken(data.session.access_token);
        
        return {
          success: true,
          data: {
            user,
            token: data.session.access_token,
          },
        };
      }

      const user: User = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        phone: userProfile.phone,
        avatar: userProfile.avatar,
        isActive: userProfile.is_active,
        isVerified: userProfile.is_verified,
        emailVerifiedAt: userProfile.email_verified_at,
        phoneVerifiedAt: userProfile.phone_verified_at,
        lastLoginAt: userProfile.last_login_at,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
      };

      await this.setAuthToken(data.session.access_token);
      
      console.log('Supabase login successful for:', user.email);
      return {
        success: true,
        data: {
          user,
          token: data.session.access_token,
        },
      };
    } catch (error) {
      console.error('Supabase login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
    phone?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      console.log('Supabase registration attempt for:', userData.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            role: userData.role,
          }
        }
      });

      if (error) {
        console.error('Supabase registration error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Registration failed: No user data',
        };
      }

      // Create user profile in users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          is_active: true,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return {
          success: false,
          error: 'Failed to create user profile',
        };
      }

      const user: User = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        phone: userProfile.phone,
        avatar: userProfile.avatar,
        isActive: userProfile.is_active,
        isVerified: userProfile.is_verified,
        emailVerifiedAt: userProfile.email_verified_at,
        phoneVerifiedAt: userProfile.phone_verified_at,
        lastLoginAt: userProfile.last_login_at,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
      };

      if (data.session?.access_token) {
        await this.setAuthToken(data.session.access_token);
      }
      
      console.log('Supabase registration successful for:', user.email);
      return {
        success: true,
        data: {
          user,
          token: data.session?.access_token || '',
        },
      };
    } catch (error) {
      console.error('Supabase registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      await this.clearAuthToken();
      
      if (error) {
        console.error('Supabase logout error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error('Supabase logout error:', error);
      await this.clearAuthToken();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }

  // Jobs
  async getJobs(filters?: {
    category?: string;
    location?: string;
    status?: string;
    clientId?: string;
    professionalId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ jobs: Job[]; total: number; limit: number; offset: number }>> {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          client:users!jobs_client_id_fkey(id, name, email, avatar),
          professional:users!jobs_professional_id_fkey(id, name, email, avatar)
        `);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.location) {
        query = query.eq('location', filters.location);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters?.professionalId) {
        query = query.eq('professional_id', filters.professionalId);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 20) - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching jobs:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const jobs: Job[] = (data || []).map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        category: job.category,
        subcategory: job.subcategory,
        location: job.location,
        status: job.status,
        clientId: job.client_id,
        professionalId: job.professional_id,
        scheduledAt: job.scheduled_at,
        completedAt: job.completed_at,
        cancelledAt: job.cancelled_at,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
        client: job.client,
        professional: job.professional,
      }));

      return {
        success: true,
        data: {
          jobs,
          total: count || 0,
          limit: filters?.limit || 20,
          offset: filters?.offset || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
      };
    }
  }

  async createJob(jobData: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    location: any;
    scheduledAt?: string;
  }, userId?: string): Promise<ApiResponse<Job>> {
    try {
      // Get user ID from parameter or try to get from Supabase auth
      let clientId = userId;
      
      if (!clientId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return {
            success: false,
            error: 'User not authenticated',
          };
        }
        clientId = user.id;
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: jobData.title,
          description: jobData.description,
          category: jobData.category,
          subcategory: jobData.subcategory,
          location: JSON.stringify(jobData.location),
          client_id: clientId,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          client:users!jobs_client_id_fkey(id, name, email, avatar),
          professional:users!jobs_professional_id_fkey(id, name, email, avatar)
        `)
        .single();

      if (error) {
        console.error('Error creating job:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const job: Job = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        location: data.location,
        status: data.status,
        clientId: data.client_id,
        professionalId: data.professional_id,
        scheduledAt: data.scheduled_at,
        completedAt: data.completed_at,
        cancelledAt: data.cancelled_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        client: data.client,
        professional: data.professional,
      };

      return {
        success: true,
        data: job,
      };
    } catch (error) {
      console.error('Error creating job:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create job',
      };
    }
  }

  // Professionals
  async getProfessionals(filters?: {
    categories?: string[];
    minRating?: number;
    maxHourlyRate?: number;
    isAvailable?: boolean;
    location?: string;
    county?: string;
    city?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ professionals: Professional[]; total: number; limit: number; offset: number }>> {
    try {
      let query = supabase
        .from('professionals')
        .select(`
          *,
          user:users!professionals_user_id_fkey(id, name, email, avatar, phone)
        `);

      if (filters?.categories?.length) {
        query = query.overlaps('categories', filters.categories);
      }
      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }
      if (filters?.maxHourlyRate) {
        query = query.lte('hourly_rate', filters.maxHourlyRate);
      }
      if (filters?.isAvailable !== undefined) {
        query = query.eq('is_available', filters.isAvailable);
      }
      // Note: professionals table doesn't have a location column
      // Location filtering is handled by county/city filters
      if (filters?.county) {
        query = query.eq('county', filters.county);
      }
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.searchQuery) {
        query = query.or(`(bio.ilike.%${filters.searchQuery}%,categories.ilike.%${filters.searchQuery}%,user.name.ilike.%${filters.searchQuery}%)`);
      }

      query = query
        .order('rating', { ascending: false })
        .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 20) - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching professionals:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const professionals: Professional[] = (data || []).map(prof => ({
        id: prof.id,
        userId: prof.user_id,
        categories: prof.categories,
        hourlyRate: prof.hourly_rate,
        currency: prof.currency,
        rating: prof.rating,
        reviewCount: prof.review_count,
        totalEarnings: prof.total_earnings,
        isVerified: prof.is_verified,
        isAvailable: prof.is_available,
        experience: prof.experience,
        bio: prof.bio,
        portfolio: prof.portfolio,
        certifications: prof.certifications,
        insurance: prof.insurance,
        workingHours: prof.working_hours,
        serviceAreas: prof.service_areas,
        createdAt: prof.created_at,
        updatedAt: prof.updated_at,
        user: prof.user,
      }));

      return {
        success: true,
        data: {
          professionals,
          total: count || 0,
          limit: filters?.limit || 20,
          offset: filters?.offset || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching professionals:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch professionals',
      };
    }
  }

  // Messages
  async getMessages(jobId: string, limit?: number, offset?: number): Promise<ApiResponse<{ messages: Message[]; total: number; limit: number; offset: number }>> {
    try {
      const { data, error, count } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, name, email, avatar),
          recipient:users!messages_recipient_id_fkey(id, name, email, avatar)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: true })
        .range(offset || 0, (offset || 0) + (limit || 50) - 1);

      if (error) {
        console.error('Error fetching messages:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const messages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        job_id: msg.job_id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        content: msg.content,
        message_type: msg.message_type,
        is_read: msg.is_read,
        read_at: msg.read_at,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        sender: msg.sender,
        recipient: msg.recipient,
      }));

      return {
        success: true,
        data: {
          messages,
          total: count || 0,
          limit: limit || 50,
          offset: offset || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
      };
    }
  }

  async sendMessage(jobId: string, messageData: {
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION';
  }): Promise<ApiResponse<{ message: Message }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // For now, we'll send to a system recipient
      // In a real app, you'd determine the actual recipient
      const { data, error } = await supabase
        .from('messages')
        .insert({
          job_id: jobId,
          sender_id: user.id,
          recipient_id: 'system', // This should be the actual recipient
          content: messageData.content,
          message_type: messageData.messageType || 'TEXT',
          is_read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, name, email, avatar),
          recipient:users!messages_recipient_id_fkey(id, name, email, avatar)
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const message: Message = {
        id: data.id,
        job_id: data.job_id,
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        content: data.content,
        message_type: data.message_type,
        is_read: data.is_read,
        read_at: data.read_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        sender: data.sender,
        recipient: data.recipient,
      };

      return {
        success: true,
        data: { message },
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  // Conversations
  async getConversations(limit?: number, offset?: number): Promise<ApiResponse<{ conversations: any[]; limit: number; offset: number }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // Get jobs where user is either client or professional
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          client_id,
          professional_id,
          updated_at
        `)
        .or(`client_id.eq.${user.id},professional_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })
        .range(offset || 0, (offset || 0) + (limit || 20) - 1);

      if (jobsError) {
        console.error('Error fetching conversations:', jobsError);
        return {
          success: false,
          error: jobsError.message,
        };
      }

      // For now, return jobs as conversations
      // In a real app, you'd join with messages to get the last message
      const conversations = (jobs || []).map(job => ({
        id: job.id,
        jobId: job.id,
        jobTitle: job.title,
        otherUser: {
          id: job.client_id === user.id ? job.professional_id : job.client_id,
          name: 'Other User', // You'd fetch this from users table
        },
        lastMessage: null,
        unreadCount: 0,
        updatedAt: job.updated_at,
      }));

      return {
        success: true,
        data: {
          conversations,
          limit: limit || 20,
          offset: offset || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch conversations',
      };
    }
  }

  // Job Applications
  async applyForJob(jobId: string, applicationData: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          professional_id: user.id,
          cover_letter: applicationData.coverLetter,
          proposed_rate: applicationData.proposedRate,
          estimated_duration: applicationData.estimatedDuration,
          status: 'PENDING',
        })
        .select()
        .single();

      if (error) {
        console.error('Error applying for job:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error applying for job:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to apply for job',
      };
    }
  }

  async acceptJobApplication(applicationId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ status: 'ACCEPTED' })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        console.error('Error accepting job application:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error accepting job application:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to accept job application',
      };
    }
  }

  async rejectJobApplication(applicationId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ status: 'REJECTED' })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        console.error('Error rejecting job application:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error rejecting job application:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject job application',
      };
    }
  }

  // Notifications
  async getNotifications(): Promise<ApiResponse<any[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // For now, return empty notifications array
      // In a real app, you'd fetch from a notifications table
      return {
        success: true,
        data: [],
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
      };
    }
  }

  // Job Details
  async getJobById(jobId: string): Promise<ApiResponse<Job>> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:users!jobs_client_id_fkey(id, name, email, avatar),
          professional:users!jobs_professional_id_fkey(id, name, email, avatar)
        `)
        .eq('id', jobId)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data as Job,
      };
    } catch (error) {
      console.error('Error fetching job:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job',
      };
    }
  }

  // Job Applications
  async getJobApplications(jobId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          professional:users!job_applications_professional_id_fkey(id, name, email, avatar),
          professional_profile:professionals!job_applications_professional_id_fkey(
            id, hourly_rate, rating, review_count, bio, categories
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.error('Error fetching job applications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job applications',
      };
    }
  }

  // Professional Details
  async getProfessional(professionalId: string): Promise<ApiResponse<Professional>> {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          user:users!professionals_user_id_fkey(id, name, email, phone, avatar)
        `)
        .eq('id', professionalId)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data as Professional,
      };
    } catch (error) {
      console.error('Error fetching professional:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch professional',
      };
    }
  }

  // Profile
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const profileUser: User = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        phone: userProfile.phone,
        avatar: userProfile.avatar,
        isActive: userProfile.is_active,
        isVerified: userProfile.is_verified,
        emailVerifiedAt: userProfile.email_verified_at,
        phoneVerifiedAt: userProfile.phone_verified_at,
        lastLoginAt: userProfile.last_login_at,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
      };

      return {
        success: true,
        data: profileUser,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          phone: updates.phone,
          avatar: updates.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const updatedUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone,
        avatar: data.avatar,
        isActive: data.is_active,
        isVerified: data.is_verified,
        emailVerifiedAt: data.email_verified_at,
        phoneVerifiedAt: data.phone_verified_at,
        lastLoginAt: data.last_login_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  // File Upload
  async uploadFile(filePath: string, base64Data: string, mimeType: string): Promise<ApiResponse<{ url: string }>> {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, this.base64ToBlob(base64Data, mimeType), {
          contentType: mimeType,
        });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      return {
        success: true,
        data: { url: urlData.publicUrl },
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      };
    }
  }

  async deleteFile(filePath: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.storage
        .from('files')
        .remove([filePath]);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file',
      };
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

export const supabaseApiClient = new SupabaseApiClient();
export default supabaseApiClient;
