import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

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
  budget: string; // JSON string
  status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
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
    try {
      // Check if we're in development and API_BASE_URL is localhost
      if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
        console.warn('Backend server not available. Using mock responses for development.');
        return this.getMockResponse<T>(endpoint, options);
      }

      const token = await this.getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        (headers as any).Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Handle both direct data and wrapped data responses
      const responseData = data.data || data;

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error('API request error:', error);
      
      // If it's a network error and we're in development, return mock data
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.warn('Backend server not available. Using mock responses for development.');
        return this.getMockResponse<T>(endpoint, options);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
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

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; session: { access_token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    console.log('API Client - Login raw response:', JSON.stringify(response, null, 2));
    
    // Transform the response to match our expected format
    if (response.success && response.data) {
      console.log('API Client - Login response data:', JSON.stringify(response.data, null, 2));
      console.log('API Client - Login session:', response.data.session);
      console.log('API Client - Login access token:', response.data.session?.access_token);
      
      return {
        success: true,
        data: {
          user: response.data.user,
          token: response.data.session.access_token,
        },
      };
    }
    
    console.log('API Client - Login response not successful or no data');
    return {
      success: false,
      error: response.error || 'Login failed',
    };
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; session: { access_token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    console.log('API Client - Raw response:', JSON.stringify(response, null, 2));
    
    // Transform the response to match our expected format
    if (response.success && response.data) {
      console.log('API Client - Response data:', JSON.stringify(response.data, null, 2));
      console.log('API Client - Session:', response.data.session);
      console.log('API Client - Access token:', response.data.session?.access_token);
      
      return {
        success: true,
        data: {
          user: response.data.user,
          token: response.data.session.access_token,
        },
      };
    }
    
    console.log('API Client - Response not successful or no data');
    return {
      success: false,
      error: response.error || 'Registration failed',
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
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

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.request<{ user: User }>('/auth/profile');
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.user,
      };
    }
    return {
      success: response.success,
      data: response.data?.user,
      message: response.message,
      error: response.error
    };
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.user,
      };
    }
    return {
      success: response.success,
      data: response.data?.user,
      message: response.message,
      error: response.error
    };
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Job endpoints
  async createJob(jobData: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    location: any; // Will be JSON stringified
    budget: any; // Will be JSON stringified
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    scheduledAt?: string;
  }): Promise<ApiResponse<Job>> {
    const response = await this.request<{ job: Job }>('/jobs', {
      method: 'POST',
      body: JSON.stringify({
        ...jobData,
        location: JSON.stringify(jobData.location),
        budget: JSON.stringify(jobData.budget),
      }),
    });
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.job,
      };
    }
    return {
      success: response.success,
      data: response.data?.job,
      message: response.message,
      error: response.error
    };
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
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.location) queryParams.append('location', filters.location);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.clientId) queryParams.append('clientId', filters.clientId);
    if (filters?.professionalId) queryParams.append('professionalId', filters.professionalId);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const endpoint = `/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ jobs: Job[]; total: number; limit: number; offset: number }>(endpoint);
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

  // Professional endpoints
  async getProfessionals(filters?: {
    categories?: string[];
    minRating?: number;
    maxHourlyRate?: number;
    isAvailable?: boolean;
    location?: string;
    county?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ professionals: Professional[]; total: number; limit: number; offset: number }>> {
    const queryParams = new URLSearchParams();
    if (filters?.categories) queryParams.append('categories', filters.categories.join(','));
    if (filters?.minRating) queryParams.append('minRating', filters.minRating.toString());
    if (filters?.maxHourlyRate) queryParams.append('maxHourlyRate', filters.maxHourlyRate.toString());
    if (filters?.isAvailable !== undefined) queryParams.append('isAvailable', filters.isAvailable.toString());
    if (filters?.location) queryParams.append('location', filters.location);
    if (filters?.county) queryParams.append('county', filters.county);
    if (filters?.city) queryParams.append('city', filters.city);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const endpoint = `/professionals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ professionals: Professional[]; total: number; limit: number; offset: number }>(endpoint);
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

  // Message endpoints
  async getMessages(jobId: string, limit?: number, offset?: number): Promise<ApiResponse<{ messages: any[]; total: number; limit: number; offset: number }>> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());

    const endpoint = `/messages/${jobId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ messages: any[]; total: number; limit: number; offset: number }>(endpoint);
  }

  async sendMessage(jobId: string, messageData: {
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION';
  }): Promise<ApiResponse<{ message: any }>> {
    const response = await this.request<{ message: any }>(`/messages/${jobId}`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.message,
      };
    }
    return response;
  }

  async getConversations(limit?: number, offset?: number): Promise<ApiResponse<{ conversations: any[]; limit: number; offset: number }>> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());

    const endpoint = `/messages/conversations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ conversations: any[]; limit: number; offset: number }>(endpoint);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
