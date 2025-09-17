import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  details?: any;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

class EnhancedApiClient {
  private client: AxiosInstance;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Failed to get auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and retries
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        this.retryCount = 0; // Reset retry count on success
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        // Handle network errors
        if (!error.response) {
          return this.handleNetworkError(error, originalRequest);
        }

        // Handle authentication errors
        if (error.response.status === 401) {
          return this.handleAuthError(error, originalRequest);
        }

        // Handle rate limiting
        if (error.response.status === 429) {
          return this.handleRateLimitError(error, originalRequest);
        }

        // Handle server errors with retry
        if (error.response.status >= 500 && this.retryCount < this.maxRetries) {
          return this.handleRetry(error, originalRequest);
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private async handleNetworkError(error: AxiosError, originalRequest: any) {
    const networkError: ApiError = {
      message: 'Nu s-a putut conecta la server. Verifică conexiunea la internet.',
      code: 'NETWORK_ERROR',
      status: 0,
    };

    // Check if we should retry network errors
    if (this.retryCount < this.maxRetries) {
      return this.handleRetry(error, originalRequest);
    }

    return Promise.reject(networkError);
  }

  private async handleAuthError(error: AxiosError, originalRequest: any) {
    // Clear invalid token
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (storageError) {
      console.error('Failed to clear auth token:', storageError);
    }

    const authError: ApiError = {
      message: 'Sesiunea a expirat. Te rugăm să te conectezi din nou.',
      code: 'AUTHENTICATION_FAILED',
      status: 401,
    };

    return Promise.reject(authError);
  }

  private async handleRateLimitError(error: AxiosError, originalRequest: any) {
    const retryAfter = error.response?.headers['retry-after'];
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.retryDelay;

    const rateLimitError: ApiError = {
      message: 'Ai făcut prea multe cereri. Te rugăm să aștepți puțin.',
      code: 'RATE_LIMIT_EXCEEDED',
      status: 429,
      details: { retryAfter: delay },
    };

    return Promise.reject(rateLimitError);
  }

  private async handleRetry(error: AxiosError, originalRequest: any) {
    this.retryCount++;
    
    // Exponential backoff
    const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
    
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const response = await this.client.request(originalRequest);
          resolve(response);
        } catch (retryError) {
          reject(retryError);
        }
      }, delay);
    });
  }

  private formatError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const response = error.response;
      return {
        message: (response.data as any)?.message || (response.data as any)?.error || 'A apărut o eroare',
        code: (response.data as any)?.code || `HTTP_${response.status}`,
        status: response.status,
        details: (response.data as any)?.details,
      };
    }

    return {
      message: error.message || 'A apărut o eroare neașteptată',
      code: 'UNKNOWN_ERROR',
      status: 0,
    };
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request(config);
      return {
        success: true,
        data: response.data,
        message: response.data?.message,
      };
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request({ ...config, method: 'DELETE', url });
  }

  // File upload
  async upload<T = any>(url: string, file: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Set auth token
  async setAuthToken(token: string) {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Failed to set auth token:', error);
    }
  }

  // Clear auth token
  async clearAuthToken() {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
  }
}

// Create singleton instance
export const enhancedApi = new EnhancedApiClient();

// Hook for using the enhanced API with network status
export const useEnhancedApi = () => {
  const networkStatus = useNetworkStatus();

  const isOnline = networkStatus.isOnline;

  const request = async <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    if (!isOnline) {
      throw {
        message: 'Nu ai conexiune la internet. Verifică conexiunea și încearcă din nou.',
        code: 'OFFLINE',
        status: 0,
      } as ApiError;
    }

    return enhancedApi.request<T>(config);
  };

  return {
    ...enhancedApi,
    request,
    isOnline,
    networkStatus,
  };
};
