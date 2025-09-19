import { supabase } from './supabaseRealtimeService';
import { User, Job, Professional, Review, Message } from '../types';

// Mobile API service that works directly with Supabase
export class MobileApiService {
  // Authentication
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { user: data.user, token: data.session?.access_token };
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
        }
      }
    });
    
    if (error) throw error;
    return { user: data.user, token: data.session?.access_token };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Jobs
  async getJobs(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        client:users!jobs_client_id_fkey(id, name, email, avatar),
        professional:users!jobs_professional_id_fkey(id, name, email, avatar)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  }

  async createJob(jobData: Partial<Job>) {
    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Professionals
  async getProfessionals(filters: {
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
  } = {}) {
    let query = supabase
      .from('professionals')
      .select(`
        *,
        user:users!professionals_user_id_fkey(id, name, email, avatar, phone)
      `);

    // Apply filters
    if (filters.categories?.length) {
      query = query.overlaps('categories', filters.categories);
    }
    
    if (filters.minRating) {
      query = query.gte('rating', filters.minRating);
    }
    
    if (filters.maxHourlyRate) {
      query = query.lte('hourly_rate', filters.maxHourlyRate);
    }
    
    if (filters.isAvailable !== undefined) {
      query = query.eq('is_available', filters.isAvailable);
    }
    
    if (filters.location) {
      query = query.eq('location', filters.location);
    }
    
    if (filters.county) {
      query = query.eq('county', filters.county);
    }
    
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters.searchQuery) {
      query = query.or(`bio.ilike.%${filters.searchQuery}%,categories.ilike.%${filters.searchQuery}%,user.name.ilike.%${filters.searchQuery}%`);
    }

    query = query
      .order('rating', { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Messages
  async getMessages(jobId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, email, avatar),
        recipient:users!messages_recipient_id_fkey(id, name, email, avatar)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async sendMessage(messageData: {
    job_id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    message_type?: string;
  }) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        message_type: messageData.message_type || 'TEXT',
        is_read: false,
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, email, avatar)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Reviews
  async getReviews(professionalId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(id, name, email, avatar)
      `)
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createReview(reviewData: {
    professional_id: string;
    reviewer_id: string;
    job_id: string;
    rating: number;
    comment: string;
  }) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(id, name, email, avatar)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  // User Profile
  async updateProfile(userId: string, profileData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // File Upload
  async uploadFile(file: File, bucket: string = 'avatars') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return publicUrl;
  }
}

// Export singleton instance
export const mobileApi = new MobileApiService();
