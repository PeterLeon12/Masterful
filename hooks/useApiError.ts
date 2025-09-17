import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  retryable?: boolean;
  onError?: (error: ApiError) => void;
}

export const useApiError = (options: ErrorHandlerOptions = {}) => {
  const [error, setError] = useState<ApiError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const { showAlert = true, retryable = true, onError } = options;

  const handleError = useCallback((error: any, context?: string) => {
    let apiError: ApiError;

    // Handle different error types
    if (error?.response?.data) {
      // Axios/HTTP error response
      const response = error.response;
      apiError = {
        message: response.data.message || response.data.error || 'A apărut o eroare la comunicarea cu serverul',
        code: response.data.code || `HTTP_${response.status}`,
        status: response.status,
        details: response.data.details,
      };
    } else if (error?.message) {
      // Standard Error object
      apiError = {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        details: error.stack,
      };
    } else if (typeof error === 'string') {
      // String error
      apiError = {
        message: error,
        code: 'STRING_ERROR',
      };
    } else {
      // Unknown error
      apiError = {
        message: 'A apărut o eroare neașteptată',
        code: 'UNKNOWN_ERROR',
        details: error,
      };
    }

    // Add context if provided
    if (context) {
      apiError.message = `${context}: ${apiError.message}`;
    }

    // Set error state
    setError(apiError);

    // Call custom error handler if provided
    if (onError) {
      onError(apiError);
    }

    // Show alert if enabled
    if (showAlert) {
      const title = getErrorTitle(apiError);
      const message = getErrorMessage(apiError);
      
      if (retryable) {
        Alert.alert(
          title,
          message,
          [
            { text: 'Încearcă din nou', onPress: () => handleRetry() },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(title, message);
      }
    }

    // Log error for debugging
    console.error('API Error:', {
      context,
      error: apiError,
      originalError: error,
    });

    return apiError;
  }, [showAlert, retryable, onError]);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setError(null);
    
    // Reset retrying state after a short delay
    setTimeout(() => setIsRetrying(false), 100);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getErrorTitle = (apiError: ApiError): string => {
    if (apiError.status === 401) return 'Autentificare necesară';
    if (apiError.status === 403) return 'Acces interzis';
    if (apiError.status === 404) return 'Nu s-a găsit';
    if (apiError.status === 422) return 'Date invalide';
    if (apiError.status === 429) return 'Prea multe cereri';
    if (apiError.status && apiError.status >= 500) return 'Eroare server';
    
    return 'Eroare';
  };

  const getErrorMessage = (apiError: ApiError): string => {
    // Check for Romanian message first
    if (apiError.details?.message_ro) {
      return apiError.details.message_ro;
    }

    // Map common error codes to user-friendly messages
    switch (apiError.code) {
      case 'VALIDATION_ERROR':
        return 'Te rugăm să verifici datele introduse și să încerci din nou.';
      case 'AUTHENTICATION_FAILED':
        return 'Email-ul sau parola nu sunt corecte. Te rugăm să încerci din nou.';
      case 'USER_NOT_FOUND':
        return 'Utilizatorul nu a fost găsit. Te rugăm să verifici datele introduse.';
      case 'EMAIL_ALREADY_EXISTS':
        return 'Această adresă de email este deja înregistrată.';
      case 'INVALID_TOKEN':
        return 'Sesiunea a expirat. Te rugăm să te conectezi din nou.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Ai făcut prea multe cereri. Te rugăm să aștepți puțin înainte să încerci din nou.';
      case 'NETWORK_ERROR':
        return 'Nu s-a putut conecta la server. Te rugăm să verifici conexiunea la internet.';
      case 'TIMEOUT_ERROR':
        return 'Cererea a expirat. Te rugăm să încerci din nou.';
      default:
        return apiError.message || 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.';
    }
  };

  const isNetworkError = (apiError: ApiError): boolean => {
    return !apiError.status || apiError.status >= 500 || 
           apiError.code === 'NETWORK_ERROR' || 
           apiError.code === 'TIMEOUT_ERROR';
  };

  const isAuthError = (apiError: ApiError): boolean => {
    return apiError.status === 401 || apiError.status === 403 ||
           apiError.code === 'AUTHENTICATION_FAILED' ||
           apiError.code === 'INVALID_TOKEN';
  };

  const isValidationError = (apiError: ApiError): boolean => {
    return apiError.status === 422 || apiError.code === 'VALIDATION_ERROR';
  };

  return {
    error,
    isRetrying,
    handleError,
    handleRetry,
    clearError,
    isNetworkError,
    isAuthError,
    isValidationError,
  };
};
