// Base API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  results: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  interests?: string[];
  followersCount: number;
  followingCount: number;
}

// Event types
export interface Event {
  id: number;
  title: string;
  city: string;
  event_type: string;
  full_address: string;
  icon: string;
  is_active: boolean;
  is_currently_open: boolean;
  is_free: boolean;
  is_open: boolean;
  open_time: string;
  close_time: string;
  start_date: string;
  end_date: string;
  price: string;
  latitude: string;
  longitude: string;
  lat_lng: {
    latitude: number;
    longitude: number;
  };
}

export interface EventCreateRequest {
  title: string;
  city: string;
  event_type: string;
  full_address: string;
  icon: string;
  open_time: string;
  close_time: string;
  start_date: string;
  end_date: string;
  price: string;
  latitude: string;
  longitude: string;
}

export interface EventUpdateRequest extends Partial<EventCreateRequest> {
  id: number;
}

// Location types
export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: string;
  rating?: number;
  reviews?: number;
  image?: string;
  description?: string;
}

// Search types
export interface SearchFilters {
  query?: string;
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface SearchRequest {
  filters: SearchFilters;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'distance' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// Authentication types
export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  success: boolean;
  message?: string;
}

// API endpoints
export type ApiEndpoint = 
  | '/auth/login'
  | '/auth/register'
  | '/auth/refresh'
  | '/auth/logout'
  | '/users/profile'
  | '/users/profile/update'
  | '/events'
  | '/events/create'
  | '/events/:id'
  | '/events/:id/update'
  | '/events/:id/delete'
  | '/events/:id/attend'
  | '/events/:id/unattend'
  | '/events/search'
  | '/locations'
  | '/locations/search'
  | '/categories';
