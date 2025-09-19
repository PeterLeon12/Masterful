import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseApiClient } from './supabaseApi';

// API Configuration - Now using Supabase
const API_BASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cjvrtumhlvbmuryremlw.supabase.co';

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
  phone?: string;
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
  applications?: JobApplication[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  professionalId: string;
  proposal: string;
  price: number;
  currency: string;
  estimatedTime: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  clientNotes?: string;
  professionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  professional?: {
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

// API Client
class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Since we're now using Supabase directly, we should delegate to supabaseApiClient
    // This method is kept for backward compatibility but should not be used for new calls
    console.warn('Using legacy API request method. Consider using supabaseApiClient directly.');
    
    // For now, return an error to force using the new Supabase API
    return {
      success: false,
      error: 'This endpoint should use supabaseApiClient instead of the legacy API client',
    };
  }

  private getMockResponse<T>(endpoint: string, options: RequestInit): ApiResponse<T> {
    // Return mock responses for development when backend is not available
    console.log(`Mock response for ${endpoint}`, options);
    
    // For now, return a success response with empty data
    // This prevents the app from crashing while we set up the backend
    return {
      success: true,
      data: {} as T,
    };
  }

  // Public HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication endpoints - Now using Supabase
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    return await supabaseApiClient.login(credentials.email, credentials.password);
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    return await supabaseApiClient.register({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      phone: userData.phone,
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return await supabaseApiClient.logout();
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return this.request<null>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    return this.request<null>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // User endpoints - Now using Supabase
  async getProfile(): Promise<ApiResponse<User>> {
    return await supabaseApiClient.getProfile();
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return await supabaseApiClient.updateProfile(updates);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Job endpoints - Now using Supabase
  async createJob(jobData: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    location: any; // Will be JSON stringified
    scheduledAt?: string;
  }): Promise<ApiResponse<Job>> {
    return await supabaseApiClient.createJob(jobData, undefined);
  }

  async getJobs(filters?: {
    category?: string;
    location?: string;
    status?: string;
    clientId?: string;
    professionalId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ jobs: Job[]; total: number; limit: number; offset: number }>> {
    return await supabaseApiClient.getJobs(filters);
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    return this.request<Job>(`/jobs/${id}`);
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<ApiResponse<Job>> {
    return this.request<Job>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteJob(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Professional endpoints - Now using Supabase
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
    return await supabaseApiClient.getProfessionals(filters);
  }

  async getProfessional(id: string): Promise<ApiResponse<Professional>> {
    return this.request<Professional>(`/professionals/${id}`);
  }

  async updateProfessionalProfile(updates: Partial<Professional>): Promise<ApiResponse<Professional>> {
    const response = await this.request<{ professional: Professional }>('/professionals/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.professional,
      };
    }
    return {
      success: response.success,
      data: response.data?.professional,
      message: response.message,
      error: response.error
    };
  }

  // Job Application endpoints
  async applyForJob(jobId: string, applicationData: {
    proposal: string;
    price: number;
    currency?: string;
    estimatedTime: string;
  }): Promise<ApiResponse<JobApplication>> {
    const response = await this.request<{ application: JobApplication }>(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.application,
      };
    }
    return {
      success: response.success,
      data: response.data?.application,
      message: response.message,
      error: response.error
    };
  }

  async getJobApplications(jobId: string): Promise<ApiResponse<{ applications: JobApplication[] }>> {
    return this.request<{ applications: JobApplication[] }>(`/jobs/${jobId}/applications`);
  }

  async getJobById(jobId: string): Promise<ApiResponse<Job>> {
    return this.request<Job>(`/jobs/${jobId}`, {
      method: 'GET',
    });
  }


  async acceptJobApplication(applicationId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/jobs/applications/${applicationId}/accept`, {
      method: 'PUT',
    });
  }

  async rejectJobApplication(applicationId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/jobs/applications/${applicationId}/reject`, {
      method: 'PUT',
    });
  }

  // Payment endpoints
  async createStripeConnectAccount(email: string, country: string = 'RO'): Promise<ApiResponse<any>> {
    return this.request<any>('/payments/connect/account', {
      method: 'POST',
      body: JSON.stringify({ email, country }),
    });
  }

  async createStripeAccountLink(refreshUrl: string, returnUrl: string): Promise<ApiResponse<any>> {
    return this.request<any>('/payments/connect/account-link', {
      method: 'POST',
      body: JSON.stringify({ refreshUrl, returnUrl }),
    });
  }

  async getStripeAccountStatus(): Promise<ApiResponse<any>> {
    return this.request<any>('/payments/connect/status', {
      method: 'GET',
    });
  }

  async createPaymentIntent(jobId: string, amount: number, currency: string = 'RON'): Promise<ApiResponse<any>> {
    return this.request<any>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify({ jobId, amount, currency }),
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<ApiResponse<any>> {
    return this.request<any>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  async createTransfer(jobId: string, amount: number, currency: string = 'RON'): Promise<ApiResponse<any>> {
    return this.request<any>('/payments/transfer', {
      method: 'POST',
      body: JSON.stringify({ jobId, amount, currency }),
    });
  }

  async createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<ApiResponse<any>> {
    return this.request<any>('/payments/refund', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, amount, reason }),
    });
  }

  async getPaymentHistory(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
    return this.request<any>(`/payments/history?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  // Message endpoints - Now using Supabase
  async getMessages(jobId: string, limit?: number, offset?: number): Promise<ApiResponse<{ messages: any[]; total: number; limit: number; offset: number }>> {
    return await supabaseApiClient.getMessages(jobId, limit, offset);
  }

  async sendMessage(jobId: string, messageData: {
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION';
  }): Promise<ApiResponse<{ message: any }>> {
    return await supabaseApiClient.sendMessage(jobId, messageData);
  }

  async getConversations(limit?: number, offset?: number): Promise<ApiResponse<{ conversations: any[]; limit: number; offset: number }>> {
    return await supabaseApiClient.getConversations(limit, offset);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
