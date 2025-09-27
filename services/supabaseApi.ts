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
  location: string; // JSON string
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  clientId: string;
  professionalId?: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline?: string;
  requirements?: string;
  images?: string[];
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

export interface Client {
  id: string;
  userId: string;
  companyName?: string;
  companySize?: string;
  preferredContactMethod: string;
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

export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: any; // JSON object
  preferences?: any; // JSON object
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

export interface Professional {
  id: string;
  userId: string;
  categories: string[]; // Array of strings
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  totalEarnings: number;
  isAvailable: boolean;
  experience: number;
  bio?: string;
  portfolio: string[]; // Array of URLs
  certifications: string[]; // Array of URLs
  insurance: boolean;
  serviceAreas: string[]; // Array of areas
  stripeAccountId?: string;
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
  job?: {
    id: string;
    title: string;
    client_id: string;
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

      // Create user profile in users table (handle existing users)
      let userProfile;
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (existingUser) {
        // User already exists, use existing profile
        userProfile = existingUser;
        console.log('User profile already exists, using existing profile');
      } else {
        // Create new user profile
        const { data: newUserProfile, error: profileError } = await supabase
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
        userProfile = newUserProfile;
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
    currentUserId?: string; // Add current user ID for TaskRabbit role-based filtering
  }): Promise<ApiResponse<{ jobs: Job[]; total: number; limit: number; offset: number }>> {
    try {
      // Get current user role for TaskRabbit-style filtering
      let currentUserRole = null;
      if (filters?.currentUserId) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', filters.currentUserId)
          .single();
        
        if (userError) {
          console.error('Error fetching user role:', userError);
        } else {
          currentUserRole = userData?.role;
          console.log('Current user role from database:', currentUserRole);
        }
      }

      let query = supabase
        .from('jobs')
        .select(`
          *,
          client:users!jobs_client_id_fkey(id, name, email, avatar),
          professional:users!jobs_professional_id_fkey(id, name, email, avatar)
        `);

      // TaskRabbit Model: Role-based job visibility
      if (currentUserRole === 'CLIENT') {
        // Clients can only see their own jobs
        console.log('Filtering jobs for CLIENT - showing only own jobs');
        query = query.eq('client_id', filters?.currentUserId);
      } else if (currentUserRole === 'PROFESSIONAL') {
        // Professionals can see all open jobs + jobs they're assigned to
        console.log('Filtering jobs for PROFESSIONAL - showing all open jobs + assigned jobs');
        query = query.or(`status.eq.OPEN,assigned_professional_id.eq.${filters?.currentUserId}`);
      } else {
        // Unauthenticated users can only see open jobs
        console.log('Filtering jobs for unauthenticated user - showing only open jobs');
        query = query.eq('status', 'OPEN');
      }

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
        location: job.location,
        status: job.status,
        clientId: job.client_id,
        professionalId: job.professional_id,
        budgetMin: job.budget_min,
        budgetMax: job.budget_max,
        deadline: job.deadline,
        requirements: job.requirements,
        images: job.images || [],
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
    location: any;
    budgetMin?: number;
    budgetMax?: number;
    deadline?: string;
    requirements?: string;
    images?: string[];
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
          location: JSON.stringify(jobData.location),
          budget_min: jobData.budgetMin,
          budget_max: jobData.budgetMax,
          deadline: jobData.deadline,
          requirements: jobData.requirements,
          images: jobData.images || [],
          client_id: clientId,
          status: 'OPEN',
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
        location: data.location,
        status: data.status,
        clientId: data.client_id,
        professionalId: data.professional_id,
        budgetMin: data.budget_min,
        budgetMax: data.budget_max,
        deadline: data.deadline,
        requirements: data.requirements,
        images: data.images || [],
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
        query = query.or(`bio.ilike.%${filters.searchQuery}%,categories.cs.@>{"${filters.searchQuery}"},user.name.ilike.%${filters.searchQuery}%`);
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
        categories: prof.categories || [],
        hourlyRate: prof.hourly_rate || 0,
        rating: prof.rating || 0,
        reviewCount: prof.review_count || 0,
        totalEarnings: prof.total_earnings || 0,
        isAvailable: prof.is_available || false,
        experience: prof.experience || 0,
        bio: prof.bio,
        portfolio: prof.portfolio || [],
        certifications: prof.certifications || [],
        insurance: prof.insurance || false,
        serviceAreas: prof.service_areas || [],
        stripeAccountId: prof.stripe_account_id,
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
    recipientId?: string; // Add recipientId parameter for TaskRabbit model
  }): Promise<ApiResponse<{ message: Message }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // TaskRabbit Model: Validate recipient and role-based messaging
      if (!messageData.recipientId) {
        return {
          success: false,
          error: 'Recipient ID is required for messaging',
        };
      }

      // Get sender and recipient roles for validation
      const { data: senderData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const { data: recipientData } = await supabase
        .from('users')
        .select('role')
        .eq('id', messageData.recipientId)
        .single();

      const senderRole = senderData?.role;
      const recipientRole = recipientData?.role;

      // TaskRabbit validation: Only allow cross-role messaging
      if (senderRole === recipientRole) {
        return {
          success: false,
          error: 'Cannot send messages to users with the same role',
        };
      }

      // Additional validation: Clients can only message professionals, professionals can only message clients
      if (senderRole === 'CLIENT' && recipientRole !== 'PROFESSIONAL') {
        return {
          success: false,
          error: 'Clients can only message professionals',
        };
      }

      if (senderRole === 'PROFESSIONAL' && recipientRole !== 'CLIENT') {
        return {
          success: false,
          error: 'Professionals can only message clients',
        };
      }

      // Validate that the job exists and the user has permission to message about it
      const { data: jobData } = await supabase
        .from('jobs')
        .select('client_id, professional_id')
        .eq('id', jobId)
        .single();

      if (!jobData) {
        return {
          success: false,
          error: 'Job not found',
        };
      }

      // Additional TaskRabbit validation: Ensure the conversation is job-related
      const isJobOwner = jobData.client_id === user.id;
      const isJobProfessional = jobData.professional_id === user.id;
      const isRecipientJobOwner = jobData.client_id === messageData.recipientId;
      const isRecipientJobProfessional = jobData.professional_id === messageData.recipientId;

      if (!(isJobOwner || isJobProfessional || isRecipientJobOwner || isRecipientJobProfessional)) {
        return {
          success: false,
          error: 'You can only message about jobs you are involved in',
        };
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          job_id: jobId,
          sender_id: user.id,
          recipient_id: messageData.recipientId,
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

  // Professionals
  async getProfessionals(filters?: {
    categories?: string[];
    location?: string;
    county?: string;
    city?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ professionals: any[]; total: number; limit: number; offset: number }>> {
    try {
      let query = supabase
        .from('professionals')
        .select(`
          *,
          user:users!professionals_user_id_fkey(id, name, email, avatar)
        `)
        .eq('is_available', true);

      if (filters?.categories && filters.categories.length > 0) {
        query = query.overlaps('categories', filters.categories);
      }

      if (filters?.searchQuery) {
        query = query.or(`bio.ilike.%${filters.searchQuery}%,user.name.ilike.%${filters.searchQuery}%`);
      }

      if (filters?.county) {
        query = query.contains('service_areas', [filters.county]);
      }

      if (filters?.city) {
        query = query.contains('service_areas', [filters.city]);
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

      const professionals = (data || []).map(prof => ({
        id: prof.id,
        userId: prof.user_id,
        hourlyRate: prof.hourly_rate,
        rating: prof.rating,
        reviewCount: prof.review_count,
        bio: prof.bio,
        categories: prof.categories,
        serviceAreas: prof.service_areas,
        isAvailable: prof.is_available,
        experienceYears: prof.experience_years,
        portfolioUrls: prof.portfolio_urls,
        certifications: prof.certifications,
        insuranceVerified: prof.insurance_verified,
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

  // Conversations
  async getConversations(limit?: number, offset?: number, userId?: string): Promise<ApiResponse<{ conversations: any[]; limit: number; offset: number }>> {
    try {
      console.log('API: Getting conversations');
      
      // Get current user from parameter or from supabase.auth
      let currentUserId = userId;
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return {
            success: false,
            error: 'User not authenticated',
          };
        }
        currentUserId = user.id;
      }
      
      console.log('Current user ID:', currentUserId);

      // Get current user role for TaskRabbit-style filtering
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', currentUserId)
        .single();

      const currentUserRole = userData?.role;
      console.log('Current user role:', currentUserRole);
      
      // Get unique job conversations for the current user with role-based filtering
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          job_id,
          job:jobs!messages_job_id_fkey(id, title, client_id, professional_id),
          sender:users!messages_sender_id_fkey(id, name, avatar, role),
          recipient:users!messages_recipient_id_fkey(id, name, avatar, role),
          content,
          created_at,
          sender_id,
          recipient_id
        `)
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching conversations:', messagesError);
        return {
          success: false,
          error: messagesError.message,
        };
      }

      // Group messages by job_id + other_user_id to create separate conversations for each professional
      const jobConversations = new Map();
      
      (messages || []).forEach(message => {
        if (!message.job) return;
        
        // TaskRabbit Model: Filter out same-role conversations
        const senderRole = message.sender?.role;
        const recipientRole = message.recipient?.role;
        
        // Skip conversations between users of the same role
        if (senderRole === recipientRole) {
          console.log('Skipping same-role conversation:', senderRole, 'to', recipientRole);
          return;
        }

        // Additional TaskRabbit validation:
        // - Clients can only message professionals (after job creation)
        // - Professionals can only message clients (whose jobs they applied to)
        if (currentUserRole === 'CLIENT') {
          // Client can only see conversations with professionals
          // Check if the other person in the conversation is a professional
          const otherUserRole = message.sender_id === currentUserId ? recipientRole : senderRole;
          if (otherUserRole !== 'PROFESSIONAL') {
            console.log('Client can only message professionals, skipping conversation with:', otherUserRole);
            return;
          }
        }
        
        if (currentUserRole === 'PROFESSIONAL') {
          // Professional can only see conversations with clients
          // Check if the other person in the conversation is a client
          const otherUserRole = message.sender_id === currentUserId ? recipientRole : senderRole;
          if (otherUserRole !== 'CLIENT') {
            console.log('Professional can only message clients, skipping conversation with:', otherUserRole);
            return;
          }
        }
        
        const jobId = message.job_id;
        const otherUserId = message.sender_id === currentUserId ? message.recipient_id : message.sender_id;
        
        // Create unique conversation key: job_id + other_user_id
        const conversationKey = `${jobId}-${otherUserId}`;
        
        if (!jobConversations.has(conversationKey)) {
          jobConversations.set(conversationKey, {
            id: conversationKey,
            jobId: jobId,
            otherUserId: otherUserId,
            jobTitle: message.job.title,
            otherUser: message.sender_id === currentUserId ? message.recipient : message.sender,
            lastMessage: {
              content: message.content,
              createdAt: message.created_at,
              senderId: message.sender_id,
            },
            unreadCount: 0,
            updatedAt: message.created_at,
          });
        } else {
          // Update the conversation with the latest message if this message is newer
          const existingConversation = jobConversations.get(conversationKey);
          if (new Date(message.created_at) > new Date(existingConversation.updatedAt)) {
            existingConversation.lastMessage = {
              content: message.content,
              createdAt: message.created_at,
              senderId: message.sender_id,
            };
            existingConversation.updatedAt = message.created_at;
          }
        }
      });

      const conversations = Array.from(jobConversations.values())
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(offset || 0, (offset || 0) + (limit || 20));

      console.log('API: Conversations loaded:', conversations.length);

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
  async applyForJob(jobId: string, applicationData: any, userId?: string): Promise<ApiResponse<any>> {
    try {
      console.log('API: Applying for job with ID:', jobId, 'Data:', applicationData, 'User ID:', userId);
      
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          professional_id: userId,
          cover_letter: applicationData.coverLetter || applicationData.proposal,
          proposed_rate: applicationData.proposedRate || applicationData.price,
          estimated_duration: applicationData.estimatedDuration || applicationData.estimatedTime,
          status: 'PENDING',
        })
        .select(`
          *,
          professional:users!job_applications_professional_id_fkey(id, name, email, avatar),
          job:jobs!job_applications_job_id_fkey(id, title, client_id)
        `)
        .single();

      console.log('API: Application result - data:', data, 'error:', error);

      if (error) {
        console.error('Error applying for job:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Create initial message in chat
      if (data && data.job) {
        const applicationMessage = `Am aplicat la job-ul "${data.job.title}". ${applicationData.coverLetter || applicationData.proposal || 'Propunere: ' + (applicationData.proposedRate || applicationData.price) + ' RON, timp estimat: ' + (applicationData.estimatedDuration || applicationData.estimatedTime)}`;
        
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            job_id: jobId,
            sender_id: userId,
            recipient_id: data.job.client_id,
            content: applicationMessage,
            message_type: 'TEXT',
            is_read: false,
          });

        if (messageError) {
          console.error('Error creating application message:', messageError);
          // Don't fail the application if message creation fails
        } else {
          console.log('Application message created successfully');
        }
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

  // Get job applications for a specific job
  async getJobApplications(jobId: string): Promise<ApiResponse<JobApplication[]>> {
    try {
      console.log('API: Getting applications for job ID:', jobId);
      
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          professional:users!job_applications_professional_id_fkey(id, name, email, avatar),
          job:jobs!job_applications_job_id_fkey(id, title, client_id)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      console.log('API: Applications result - data:', data, 'error:', error);

      if (error) {
        console.error('Error fetching applications:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const applications: JobApplication[] = (data || []).map(app => ({
        id: app.id,
        job_id: app.job_id,
        professional_id: app.professional_id,
        proposal: app.cover_letter,
        price: app.proposed_rate,
        estimated_time: app.estimated_duration,
        status: app.status,
        created_at: app.created_at,
        updated_at: app.updated_at,
        professional: app.professional,
        job: app.job,
      }));

      return {
        success: true,
        data: applications,
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications',
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

  // Get jobs by client
  async getJobsByClient(clientId: string): Promise<ApiResponse<{ jobs: Job[]; total: number }>> {
    try {
      const { data, error, count } = await supabase
        .from('jobs')
        .select(`
          *,
          client:users!jobs_client_id_fkey(id, name, email, avatar),
          professional:users!jobs_professional_id_fkey(id, name, email, avatar)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching client jobs:', error);
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
        location: job.location,
        status: job.status,
        clientId: job.client_id,
        professionalId: job.professional_id,
        budgetMin: job.budget_min,
        budgetMax: job.budget_max,
        deadline: job.deadline,
        requirements: job.requirements,
        images: job.images || [],
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
        },
      };
    } catch (error) {
      console.error('Error fetching client jobs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch client jobs',
      };
    }
  }

  // Delete job
  async deleteJob(jobId: string): Promise<ApiResponse<void>> {
    try {
      console.log('API: Attempting to delete job with ID:', jobId);
      const { data, error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .select();

      console.log('API: Delete result - data:', data, 'error:', error);

      if (error) {
        console.error('API: Error deleting job:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      console.log('API: Job deleted successfully');
      return {
        success: true,
      };
    } catch (error) {
      console.error('API: Error deleting job:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete job',
      };
    }
  }

  // Update job
  async updateJob(jobId: string, jobData: {
    title?: string;
    description?: string;
    category?: string;
    location?: string;
    budgetMin?: number;
    budgetMax?: number;
    deadline?: string;
    requirements?: string;
    images?: string[];
  }, userId?: string): Promise<ApiResponse<Job>> {
    try {
      console.log('API: Updating job with ID:', jobId, 'Data:', jobData, 'User ID:', userId);
      
      // If userId is provided, use it for permission check
      if (userId) {
        // Check if job exists and belongs to current user
        const { data: existingJob, error: fetchError } = await supabase
          .from('jobs')
          .select('id, client_id')
          .eq('id', jobId)
          .eq('client_id', userId)
          .single();

        if (fetchError || !existingJob) {
          console.log('API: Job not found or not owned by user:', fetchError);
          return {
            success: false,
            error: 'Job not found or you do not have permission to update it',
          };
        }
        console.log('API: Job found, proceeding with update');
      }

      const { data, error } = await supabase
        .from('jobs')
        .update({
          title: jobData.title,
          description: jobData.description,
          category: jobData.category,
          location: typeof jobData.location === 'object' ? JSON.stringify(jobData.location) : jobData.location,
          budget_min: jobData.budgetMin,
          budget_max: jobData.budgetMax,
          deadline: jobData.deadline,
          requirements: jobData.requirements,
          images: jobData.images,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)
        .select(`
          *,
          client:users!jobs_client_id_fkey(id, name, email, avatar),
          professional:users!jobs_professional_id_fkey(id, name, email, avatar)
        `);

      console.log('API: Update result - data:', data, 'error:', error);

      if (error) {
        console.error('Error updating job:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data || data.length === 0) {
        console.log('API: No rows updated');
        return {
          success: false,
          error: 'No rows were updated. Job may not exist or you may not have permission.',
        };
      }

      const updatedJob = data[0];
      const job: Job = {
        id: updatedJob.id,
        title: updatedJob.title,
        description: updatedJob.description,
        category: updatedJob.category,
        location: updatedJob.location,
        status: updatedJob.status,
        clientId: updatedJob.client_id,
        professionalId: updatedJob.professional_id,
        budgetMin: updatedJob.budget_min,
        budgetMax: updatedJob.budget_max,
        deadline: updatedJob.deadline,
        requirements: updatedJob.requirements,
        images: updatedJob.images || [],
        createdAt: updatedJob.created_at,
        updatedAt: updatedJob.updated_at,
        client: updatedJob.client,
        professional: updatedJob.professional,
      };

      return {
        success: true,
        data: job,
      };
    } catch (error) {
      console.error('Error updating job:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update job',
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
          job:jobs!job_applications_job_id_fkey(id, title, client_id)
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

  // Clients
  async getClientProfile(): Promise<ApiResponse<Client>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data: clientProfile, error } = await supabase
        .from('clients')
        .select(`
          *,
          user:users!clients_user_id_fkey(id, name, email, phone, avatar)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching client profile:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const client: Client = {
        id: clientProfile.id,
        userId: clientProfile.user_id,
        companyName: clientProfile.company_name,
        companySize: clientProfile.company_size,
        preferredContactMethod: clientProfile.preferred_contact_method,
        createdAt: clientProfile.created_at,
        updatedAt: clientProfile.updated_at,
        user: clientProfile.user,
      };

      return {
        success: true,
        data: client,
      };
    } catch (error) {
      console.error('Error fetching client profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch client profile',
      };
    }
  }

  async updateClientProfile(updates: Partial<Client>): Promise<ApiResponse<Client>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data, error } = await supabase
        .from('clients')
        .update({
          company_name: updates.companyName,
          company_size: updates.companySize,
          preferred_contact_method: updates.preferredContactMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select(`
          *,
          user:users!clients_user_id_fkey(id, name, email, phone, avatar)
        `)
        .single();

      if (error) {
        console.error('Error updating client profile:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const updatedClient: Client = {
        id: data.id,
        userId: data.user_id,
        companyName: data.company_name,
        companySize: data.company_size,
        preferredContactMethod: data.preferred_contact_method,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        user: data.user,
      };

      return {
        success: true,
        data: updatedClient,
      };
    } catch (error) {
      console.error('Error updating client profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update client profile',
      };
    }
  }

  // Profiles
  async getProfile(): Promise<ApiResponse<Profile>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user:users!profiles_user_id_fkey(id, name, email, phone, avatar)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const userProfile: Profile = {
        id: profile.id,
        userId: profile.user_id,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        socialLinks: profile.social_links,
        preferences: profile.preferences,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        user: profile.user,
      };

      return {
        success: true,
        data: userProfile,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  }

  async updateUserRole(role: string): Promise<ApiResponse<User>> {
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
          role: role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select(`
          id,
          email,
          name,
          role,
          phone,
          avatar,
          is_active,
          is_verified,
          email_verified_at,
          phone_verified_at,
          last_login_at,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        console.error('Error updating user role:', error);
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
      console.error('Error updating user role:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user role',
      };
    }
  }

  async updateProfile(updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          bio: updates.bio,
          location: updates.location,
          website: updates.website,
          social_links: updates.socialLinks,
          preferences: updates.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select(`
          *,
          user:users!profiles_user_id_fkey(id, name, email, phone, avatar)
        `)
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      const updatedProfile: Profile = {
        id: data.id,
        userId: data.user_id,
        bio: data.bio,
        location: data.location,
        website: data.website,
        socialLinks: data.social_links,
        preferences: data.preferences,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        user: data.user,
      };

      return {
        success: true,
        data: updatedProfile,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  // User Profile (for backward compatibility)
  async getUserProfile(): Promise<ApiResponse<User>> {
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
        console.error('Error fetching user profile:', error);
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
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user profile',
      };
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
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
