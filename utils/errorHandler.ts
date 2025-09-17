export interface AppError {
  code: string;
  message: string;
  details?: string;
  userMessage: string;
}

export class AppError extends Error {
  public code: string;
  public details?: string;
  public userMessage: string;

  constructor(code: string, message: string, userMessage?: string, details?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.userMessage = userMessage || message;
  }
}

export const createAppError = (
  code: string,
  message: string,
  userMessage?: string,
  details?: string
): AppError => {
  return new AppError(code, message, userMessage, details);
};

export const handleApiError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error.response?.status) {
    // HTTP error
    switch (error.response.status) {
      case 400:
        return createAppError(
          'VALIDATION_ERROR',
          'Bad Request',
          'Datele introduse nu sunt valide. Te rugăm să verifici și să încerci din nou.',
          error.response.data?.error
        );
      case 401:
        return createAppError(
          'UNAUTHORIZED',
          'Unauthorized',
          'Sesiunea a expirat. Te rugăm să te conectezi din nou.',
          error.response.data?.error
        );
      case 403:
        return createAppError(
          'FORBIDDEN',
          'Forbidden',
          'Nu ai permisiunea să accesezi această resursă.',
          error.response.data?.error
        );
      case 404:
        return createAppError(
          'NOT_FOUND',
          'Not Found',
          'Resursa căutată nu a fost găsită.',
          error.response.data?.error
        );
      case 409:
        return createAppError(
          'CONFLICT',
          'Conflict',
          'Această resursă există deja.',
          error.response.data?.error
        );
      case 422:
        return createAppError(
          'VALIDATION_ERROR',
          'Unprocessable Entity',
          'Datele introduse nu sunt valide. Te rugăm să verifici și să încerci din nou.',
          error.response.data?.error
        );
      case 429:
        return createAppError(
          'RATE_LIMIT',
          'Too Many Requests',
          'Ai făcut prea multe cereri. Te rugăm să aștepți puțin înainte să încerci din nou.',
          error.response.data?.error
        );
      case 500:
        return createAppError(
          'SERVER_ERROR',
          'Internal Server Error',
          'A apărut o eroare pe server. Te rugăm să încerci din nou mai târziu.',
          error.response.data?.error
        );
      default:
        return createAppError(
          'HTTP_ERROR',
          `HTTP ${error.response.status}`,
          'A apărut o eroare neașteptată. Te rugăm să încerci din nou.',
          error.response.data?.error
        );
    }
  }

  if (error.request) {
    // Network error
    return createAppError(
      'NETWORK_ERROR',
      'Network Error',
      'Nu s-a putut conecta la server. Verifică conexiunea la internet și încearcă din nou.',
      error.message
    );
  }

  // Generic error
  return createAppError(
    'UNKNOWN_ERROR',
    error.message || 'Unknown error',
    'A apărut o eroare neașteptată. Te rugăm să încerci din nou.',
    error.stack
  );
};

export const getErrorMessage = (error: any): string => {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  
  const appError = handleApiError(error);
  return appError.userMessage;
};

export const isNetworkError = (error: any): boolean => {
  if (error instanceof AppError) {
    return error.code === 'NETWORK_ERROR';
  }
  
  const appError = handleApiError(error);
  return appError.code === 'NETWORK_ERROR';
};

export const isAuthError = (error: any): boolean => {
  if (error instanceof AppError) {
    return error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN';
  }
  
  const appError = handleApiError(error);
  return appError.code === 'UNAUTHORIZED' || appError.code === 'FORBIDDEN';
};
