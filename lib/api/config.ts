import Constants from 'expo-constants';

/**
 * API Configuration for Happenin Mobile App
 * 
 * Environment Configuration:
 * - Development: Uses localhost:3000 for simulator/emulator, or local IP for physical devices
 * - Staging: Uses staging-api.happenin.com
 * - Production: Uses api.happenin.com
 * 
 * To configure for development on physical devices:
 * 1. Set LOCAL_IP environment variable: export LOCAL_IP=192.168.1.100
 * 2. Or use setLocalDevelopmentIP('192.168.1.100') in your code
 * 3. Make sure your device and computer are on the same network
 * 
 * Environment can be set in app.config.js:
 * extra: {
 *   environment: 'development' | 'staging' | 'production'
 * }
 */

// API Configuration
export const API_CONFIG = {
  // Base URL - can be configured per environment
  BASE_URL: Constants.expoConfig?.extra?.apiUrl || 'https://api.happenin.com',
  
  // API Version
  VERSION: 'v1',
  
  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    BURST_LIMIT: 10,
  },
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Happenin-Mobile/1.0.0',
  },
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      VERIFY: '/auth/verify',
    },
    USERS: {
      PROFILE: '/users/profile',
      UPDATE: '/users/profile/update',
      FOLLOWERS: '/users/:id/followers',
      FOLLOWING: '/users/:id/following',
      FOLLOW: '/users/:id/follow',
      UNFOLLOW: '/users/:id/unfollow',
    },
    EVENTS: {
      LIST: '/events',
      CREATE: '/events/create',
      DETAILS: '/events/:id',
      UPDATE: '/events/:id/update',
      DELETE: '/events/:id/delete',
      ATTEND: '/events/:id/attend',
      UNATTEND: '/events/:id/unattend',
      SEARCH: '/events/search',
      NEARBY: '/events/nearby',
    },
    LOCATIONS: {
      LIST: '/locations',
      SEARCH: '/locations/search',
      NEARBY: '/locations/nearby',
      DETAILS: '/locations/:id',
    },
    CATEGORIES: {
      LIST: '/categories',
      POPULAR: '/categories/popular',
    },
    SEARCH: {
      GLOBAL: '/search',
      SUGGESTIONS: '/search/suggestions',
    },
  },
} as const;

// Environment-specific overrides
export const getApiConfig = () => {
  // Try to get environment from expo config first
  let env = Constants.expoConfig?.extra?.environment;
  
  // Fallback to NODE_ENV if not set in expo config
  if (!env) {
    env = process.env.NODE_ENV || 'development';
  }
  
  // Handle development environments
  if (env === 'development' || env === 'dev') {
    // Check if we're running on a physical device vs simulator/emulator
    const isPhysicalDevice = Constants.deviceName && !Constants.deviceName.includes('Simulator') && !Constants.deviceName.includes('Emulator');
    
    if (isPhysicalDevice) {
      // For physical devices, use your computer's local IP address
      // You can override this with an environment variable
      const localIp = process.env.LOCAL_IP || '192.168.1.243'; // Common local IP
      return {
        ...API_CONFIG,
        BASE_URL: `http://${localIp}:8000`,
        TIMEOUT: 60000,
      };
    } else {
      // For simulator/emulator, localhost works fine
      return {
        ...API_CONFIG,
        BASE_URL: 'http://localhost:8000',
        TIMEOUT: 60000,
      };
    }
  }
  
  // Handle other environments
  switch (env) {
    case 'staging':
      return {
        ...API_CONFIG,
        BASE_URL: 'https://staging-api.happenin.com',
      };
    case 'production':
      return API_CONFIG;
    default:
      // Default to development if environment is not recognized
      return {
        ...API_CONFIG,
        BASE_URL: 'http://localhost:3000',
        TIMEOUT: 60000,
      };
  }
};

// Helper to build full API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
  const config = getApiConfig();
  let url = `${config.BASE_URL}/api/${config.VERSION}${endpoint}`;
  console.log('URL:', url);
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Helper to set local IP for development on physical devices
export const setLocalDevelopmentIP = (ipAddress: string) => {
  if (process.env.NODE_ENV === 'development') {
    process.env.LOCAL_IP = ipAddress;
  }
};

// Helper to get current API configuration
export const getCurrentApiConfig = () => {
  return getApiConfig();
};

// API Response status codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
