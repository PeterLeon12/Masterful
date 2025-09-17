import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedApiClient, EnhancedApiOptions } from '@/services/enhancedApiClient';
import { useNetworkStatus } from './useNetworkStatus';
import { ApiResponse } from '@/services/api';

export interface UseOfflineApiState<T> {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  isOffline: boolean;
  isStale: boolean;
}

export interface UseOfflineApiOptions<T = any> extends EnhancedApiOptions {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  refreshInterval?: number;
}

export function useOfflineApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseOfflineApiOptions = {}
) {
  const {
    immediate = true,
    onSuccess,
    onError,
    refreshInterval,
    enableOfflineCache = true,
    cacheKey,
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  const { isOnline } = useNetworkStatus();
  const [state, setState] = useState<UseOfflineApiState<T>>({
    data: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    isOffline: !isOnline,
    isStale: false,
  });

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Update online status
  useEffect(() => {
    enhancedApiClient.setOnlineStatus(isOnline ?? false);
    setState(prev => ({
      ...prev,
      isOffline: !isOnline,
    }));
  }, [isOnline]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const execute = useCallback(async (isRefresh = false) => {
    if (!isMountedRef.current) return;

    setState(prev => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      error: null,
    }));

    try {
      const response = await enhancedApiClient.request(apiCall, {
        enableOfflineCache,
        cacheKey,
        retryAttempts,
        retryDelay,
      });

      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          data: response.data || null,
          isLoading: false,
          isRefreshing: false,
          error: null,
          isStale: false,
        }));

        onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Request failed';
        setState(prev => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: errorMessage,
        }));

        onError?.(errorMessage);
      }
    } catch (error) {
      if (!isMountedRef.current) return;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: errorMessage,
      }));

      onError?.(errorMessage);
    }
  }, [apiCall, onSuccess, onError, enableOfflineCache, cacheKey, retryAttempts, retryDelay]);

  const refresh = useCallback(() => {
    execute(true);
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      isOffline: !isOnline,
      isStale: false,
    });
  }, [isOnline]);

  // Auto-refresh when coming back online
  useEffect(() => {
    if (isOnline && state.data && state.isStale) {
      refresh();
    }
  }, [isOnline, state.data, state.isStale, refresh]);

  // Initial load
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval && isOnline) {
      refreshTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setState(prev => ({ ...prev, isStale: true }));
          refresh();
        }
      }, refreshInterval);

      return () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
      };
    }
  }, [refreshInterval, isOnline, refresh]);

  return {
    ...state,
    refresh,
    reset,
    execute,
  };
}

// Convenience hooks for common API calls
export function useOfflineJobs(options: UseOfflineApiOptions = {}) {
  return useOfflineApi(
    () => enhancedApiClient.getJobs(),
    { cacheKey: 'jobs', ...options }
  );
}

export function useOfflineProfessionals(options: UseOfflineApiOptions = {}) {
  return useOfflineApi(
    () => enhancedApiClient.getProfessionals(),
    { cacheKey: 'professionals', ...options }
  );
}

export function useOfflineConversations(options: UseOfflineApiOptions = {}) {
  return useOfflineApi(
    () => enhancedApiClient.getConversations(),
    { cacheKey: 'conversations', ...options }
  );
}

export function useOfflineProfile(options: UseOfflineApiOptions = {}) {
  return useOfflineApi(
    () => enhancedApiClient.getProfile(),
    { cacheKey: 'profile', ...options }
  );
}
