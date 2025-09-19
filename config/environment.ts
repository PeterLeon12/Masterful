// Environment configuration
export const ENV = {
  // API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  API_TIMEOUT: 10000, // 10 seconds
  
  // App Configuration
  APP_NAME: 'Masterful',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_PUSH_NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_CRASH_REPORTING: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
  
  // Payment Configuration
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  ENABLE_IN_APP_PURCHASES: process.env.EXPO_PUBLIC_ENABLE_IN_APP_PURCHASES === 'true',
  
  // Maps & Location
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  ENABLE_LOCATION_SERVICES: process.env.EXPO_PUBLIC_ENABLE_LOCATION_SERVICES === 'true',
  
  // Social Login
  ENABLE_GOOGLE_LOGIN: process.env.EXPO_PUBLIC_ENABLE_GOOGLE_LOGIN === 'true',
  ENABLE_APPLE_LOGIN: process.env.EXPO_PUBLIC_ENABLE_APPLE_LOGIN === 'true',
  
  // Development
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  ENABLE_DEBUG_MODE: process.env.EXPO_PUBLIC_ENABLE_DEBUG_MODE === 'true',
  
  // Cache Configuration
  CACHE_DURATION: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  
  // Validation
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  
  // Rate Limiting
  API_RATE_LIMIT: {
    LOGIN_ATTEMPTS: 5,
    LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
    REGISTER_ATTEMPTS: 3,
    REGISTER_WINDOW: 60 * 60 * 1000, // 1 hour
  },
};

// Environment-specific overrides
if (ENV.IS_DEVELOPMENT) {
  ENV.API_BASE_URL = 'http://localhost:3000/api';
  ENV.ENABLE_DEBUG_MODE = true;
}

if (ENV.IS_PRODUCTION) {
  ENV.API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.masterful.app/api';
  ENV.ENABLE_DEBUG_MODE = false;
}

// Validation
export const validateEnvironment = (): string[] => {
  const errors: string[] = [];
  
  if (!ENV.API_BASE_URL) {
    errors.push('API_BASE_URL is required');
  }
  
  if (ENV.ENABLE_GOOGLE_LOGIN && !process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) {
    errors.push('GOOGLE_CLIENT_ID is required when Google login is enabled');
  }
  
  if (ENV.ENABLE_APPLE_LOGIN && !process.env.EXPO_PUBLIC_APPLE_CLIENT_ID) {
    errors.push('APPLE_CLIENT_ID is required when Apple login is enabled');
  }
  
  if (ENV.ENABLE_PUSH_NOTIFICATIONS && !process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID) {
    errors.push('FIREBASE_PROJECT_ID is required when push notifications are enabled');
  }
  
  return errors;
};

// Export default environment
export default ENV;
