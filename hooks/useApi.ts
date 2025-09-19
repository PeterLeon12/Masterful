import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseApiClient, ApiResponse } from '@/services/supabaseApi';
import { getErrorMessage } from '@/utils/errorHandler';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  refreshInterval?: number;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError, refreshInterval } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isRefreshing: false,
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

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
      const response = await apiCall();
      
      if (!isMountedRef.current) return;

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          data: response.data || null,
          isLoading: false,
          isRefreshing: false,
          error: null,
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
      
      const errorMessage = getErrorMessage(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: errorMessage,
      }));
      
      onError?.(errorMessage);
    }
  }, [apiCall, onSuccess, onError]);

  const refresh = useCallback(() => {
    execute(true);
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isRefreshing: false,
    });
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const scheduleRefresh = () => {
        refreshTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            refresh();
            scheduleRefresh(); // Schedule next refresh
          }
        }, refreshInterval) as any;
      };

      scheduleRefresh();

      return () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
      };
    }
  }, [refreshInterval, refresh]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    refresh,
    reset,
  };
}

// Specialized hooks for common operations
export function useJobs(filters?: {
  category?: string;
  location?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useApi(
    () => supabaseApiClient.getJobs(filters),
    { immediate: true }
  );
}

export function useProfessionals(filters?: {
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
}) {
  const apiCall = useCallback(() => supabaseApiClient.getProfessionals(filters), [filters]);
  return useApi(apiCall, { immediate: true });
}

export function useProfile() {
  return useApi(
    () => supabaseApiClient.getProfile(),
    { immediate: true }
  );
}

// Mutation hooks for write operations
export function useCreateJob() {
  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    success: false,
  });

  const createJob = useCallback(async (jobData: any) => {
    setState({ isLoading: true, error: null, success: false });
    
    try {
      const response = await supabaseApiClient.createJob(jobData);
      
      if (response.success) {
        setState({ isLoading: false, error: null, success: true });
        return response.data;
      } else {
        const errorMessage = response.error || 'Failed to create job';
        setState({ isLoading: false, error: errorMessage, success: false });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState({ isLoading: false, error: errorMessage, success: false });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    createJob,
    reset,
  };
}

export function useUpdateProfile() {
  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    success: false,
  });

  const updateProfile = useCallback(async (updates: any) => {
    setState({ isLoading: true, error: null, success: false });
    
    try {
      const response = await supabaseApiClient.updateProfile(updates);
      
      if (response.success) {
        setState({ isLoading: false, error: null, success: true });
        return response.data;
      } else {
        const errorMessage = response.error || 'Failed to update profile';
        setState({ isLoading: false, error: errorMessage, success: false });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState({ isLoading: false, error: errorMessage, success: false });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    updateProfile,
    reset,
  };
}
