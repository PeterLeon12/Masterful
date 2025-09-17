import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineStorageService } from './offlineStorage';
import { apiClient, ApiResponse } from './api';

export interface EnhancedApiOptions {
  enableOfflineCache?: boolean;
  cacheKey?: string;
  cacheExpiry?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class EnhancedApiClient {
  private static instance: EnhancedApiClient;
  private isOnline: boolean = true;

  static getInstance(): EnhancedApiClient {
    if (!EnhancedApiClient.instance) {
      EnhancedApiClient.instance = new EnhancedApiClient();
    }
    return EnhancedApiClient.instance;
  }

  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
  }

  async request<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    options: EnhancedApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      enableOfflineCache = true,
      cacheKey,
      retryAttempts = 3,
      retryDelay = 1000,
    } = options;

    // If offline and cache is enabled, try to return cached data
    if (!this.isOnline && enableOfflineCache && cacheKey) {
      const cachedData = await OfflineStorageService.get<T>(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          message: 'Data from cache (offline)',
        };
      }
    }

    // Attempt API call with retries
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const response = await apiCall();
        
        // Cache successful responses if offline cache is enabled
        if (response.success && response.data && enableOfflineCache && cacheKey) {
          await OfflineStorageService.set(cacheKey, response.data);
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // If this is the last attempt, try to return cached data
        if (attempt === retryAttempts && enableOfflineCache && cacheKey) {
          const cachedData = await OfflineStorageService.get<T>(cacheKey);
          if (cachedData) {
            return {
              success: true,
              data: cachedData,
              message: 'Data from cache (network error)',
            };
          }
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    // If all attempts failed and no cached data, return error
    return {
      success: false,
      error: lastError?.message || 'Network request failed',
    };
  }

  // Convenience methods for common API calls
  async getJobs(options: EnhancedApiOptions = {}) {
    return this.request(
      () => apiClient.getJobs(),
      { cacheKey: 'jobs', ...options }
    );
  }

  async getProfessionals(options: EnhancedApiOptions = {}) {
    return this.request(
      () => apiClient.getProfessionals(),
      { cacheKey: 'professionals', ...options }
    );
  }

  async getConversations(options: EnhancedApiOptions = {}) {
    return this.request(
      () => apiClient.getConversations(),
      { cacheKey: 'conversations', ...options }
    );
  }

  async getProfile(options: EnhancedApiOptions = {}) {
    return this.request(
      () => apiClient.getProfile(),
      { cacheKey: 'profile', ...options }
    );
  }

  // Clear all cached data
  async clearCache(): Promise<void> {
    await OfflineStorageService.clear();
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    keys: string[];
    size: number;
  }> {
    const keys = await OfflineStorageService.getAllKeys();
    const size = await OfflineStorageService.getSize();
    return { keys, size };
  }
}

export const enhancedApiClient = EnhancedApiClient.getInstance();
