import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

if (!process.env['SUPABASE_URL'] || !process.env['SUPABASE_ANON_KEY']) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
}

// Create Supabase client
export const supabase = createClient(
  process.env['SUPABASE_URL'],
  process.env['SUPABASE_ANON_KEY'],
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

// Service class for database operations
export class SupabaseService {
  public client = supabase;

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        logger.error('Supabase health check failed:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Supabase health check error:', error);
      return false;
    }
  }

  // User operations
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
    phone?: string;
  }) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await this.client.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'CLIENT',
            phone: userData.phone
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Create user profile in database
      const { data: profileData, error: profileError } = await this.client
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'CLIENT',
          phone: userData.phone,
          is_active: true,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, clean up auth user
        await this.client.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      return profileData;
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Find user by email error:', error);
      throw error;
    }
  }

  async findUserById(id: string) {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Find user by ID error:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: any) {
    try {
      const { data, error } = await this.client
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  // Professional operations
  async createProfessional(professionalData: {
    user_id: string;
    categories?: string;
    hourly_rate?: number;
    bio?: string;
    service_areas?: string;
    is_available?: boolean;
    rating?: number;
    review_count?: number;
    total_earnings?: number;
    experience?: number;
    portfolio?: string;
    certifications?: string;
    insurance?: boolean;
  }) {
    try {
      const { data, error } = await this.client
        .from('professionals')
        .insert({
          ...professionalData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Create professional error:', error);
      throw error;
    }
  }

  async findProfessionalByUserId(userId: string) {
    try {
      const { data, error } = await this.client
        .from('professionals')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Find professional by user ID error:', error);
      throw error;
    }
  }

  async updateProfessional(id: string, updates: any) {
    try {
      const { data, error } = await this.client
        .from('professionals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Update professional error:', error);
      throw error;
    }
  }

  // Job operations
  async createJob(jobData: {
    client_id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    budget_min?: number;
    budget_max?: number;
    status?: string;
    deadline?: string;
    requirements?: string;
    images?: string[];
  }) {
    try {
      const { data, error } = await this.client
        .from('jobs')
        .insert({
          ...jobData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Create job error:', error);
      throw error;
    }
  }

  async findJobById(id: string) {
    try {
      const { data, error } = await this.client
        .from('jobs')
        .select(`
          *,
          client:users!jobs_client_id_fkey(*),
          applications:job_applications(*)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Find job by ID error:', error);
      throw error;
    }
  }

  async getJobs(filters: {
    category?: string;
    location?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      let query = this.client
        .from('jobs')
        .select(`
          *,
          client:users!jobs_client_id_fkey(*),
          applications:job_applications(*)
        `);

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Get jobs error:', error);
      throw error;
    }
  }

  // Message operations
  async createMessage(messageData: {
    sender_id: string;
    recipient_id: string;
    job_id?: string;
    content: string;
    message_type?: string;
  }) {
    try {
      const { data, error } = await this.client
        .from('messages')
        .insert({
          ...messageData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Create message error:', error);
      throw error;
    }
  }

  async getMessages(jobId: string) {
    try {
      const { data, error } = await this.client
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*),
          recipient:users!messages_recipient_id_fkey(*)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Get messages error:', error);
      throw error;
    }
  }

  // Payment operations
  async createPayment(paymentData: {
    client_id: string;
    professional_id: string;
    job_id: string;
    amount: number;
    currency: string;
    status: string;
    stripe_payment_intent_id?: string;
    stripe_charge_id?: string;
  }) {
    try {
      const { data, error } = await this.client
        .from('payments')
        .insert({
          ...paymentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Create payment error:', error);
      throw error;
    }
  }

  async updatePayment(id: string, updates: any) {
    try {
      const { data, error } = await this.client
        .from('payments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Update payment error:', error);
      throw error;
    }
  }

  // Review operations
  async createReview(reviewData: {
    author_id: string;
    recipient_id: string;
    job_id: string;
    rating: number;
    comment?: string;
  }) {
    try {
      const { data, error } = await this.client
        .from('reviews')
        .insert({
          ...reviewData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Create review error:', error);
      throw error;
    }
  }

  async getReviews(professionalId: string) {
    try {
      const { data, error } = await this.client
        .from('reviews')
        .select(`
          *,
          author:users!reviews_author_id_fkey(*),
          job:jobs(*)
        `)
        .eq('recipient_id', professionalId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Get reviews error:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();
