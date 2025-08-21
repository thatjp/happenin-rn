import { apiClient } from '../client';
import {
  ApiResponse,
  Location,
  PaginatedResponse,
  SearchFilters
} from '../types';

export class LocationsService {
  /**
   * Get all locations with pagination
   */
  static async getLocations(page = 1, limit = 20): Promise<PaginatedResponse<Location>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Location>>('/locations', {
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Get a specific location by ID
   */
  static async getLocation(id: string): Promise<Location> {
    try {
      const response = await apiClient.get<ApiResponse<Location>>(`/locations/${id}`);
      return response.data.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Search locations with filters
   */
  static async searchLocations(
    filters: SearchFilters, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedResponse<Location>> {
    try {
      const response = await apiClient.post<PaginatedResponse<Location>>('/locations/search', {
        filters,
        page,
        limit,
        sortBy: 'relevance',
        sortOrder: 'desc',
      });
      return response.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Get locations near a specific point
   */
  static async getNearbyLocations(
    latitude: number, 
    longitude: number, 
    radius = 10, // km
    category?: string,
    page = 1, 
    limit = 20
  ): Promise<PaginatedResponse<Location>> {
    try {
      const params: Record<string, any> = {
        latitude,
        longitude,
        radius,
        page,
        limit,
      };
      
      if (category) {
        params.category = category;
      }
      
      const response = await apiClient.get<PaginatedResponse<Location>>('/locations/nearby', params);
      return response.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Get locations by category
   */
  static async getLocationsByCategory(
    category: string, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedResponse<Location>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Location>>('/locations', {
        category,
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Get popular locations
   */
  static async getPopularLocations(page = 1, limit = 20): Promise<PaginatedResponse<Location>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Location>>('/locations/popular', {
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Get trending locations
   */
  static async getTrendingLocations(page = 1, limit = 20): Promise<PaginatedResponse<Location>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Location>>('/locations/trending', {
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Get location suggestions for search
   */
  static async getLocationSuggestions(query: string, limit = 10): Promise<Location[]> {
    try {
      const response = await apiClient.get<ApiResponse<Location[]>>('/locations/suggestions', {
        query,
        limit,
      });
      return response.data.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Get location categories
   */
  static async getLocationCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get<ApiResponse<string[]>>('/locations/categories');
      return response.data.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Get locations by coordinates (reverse geocoding)
   */
  static async getLocationsByCoordinates(
    latitude: number, 
    longitude: number
  ): Promise<Location[]> {
    try {
      const response = await apiClient.get<ApiResponse<Location[]>>('/locations/coordinates', {
        latitude,
        longitude,
      });
      return response.data.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Get location statistics
   */
  static async getLocationStats(): Promise<{
    totalLocations: number;
    categories: Record<string, number>;
    popularAreas: Array<{ name: string; count: number }>;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/locations/stats');
      return response.data.data;
    } catch (error) {
      throw this.handleLocationError(error);
    }
  }

  /**
   * Handle location-specific errors
   */
  private static handleLocationError(error: any): Error {
    if (error?.status === 404) {
      return new Error('Location not found.');
    }
    
    if (error?.status === 400) {
      return new Error('Invalid location parameters provided.');
    }
    
    if (error?.status === 422) {
      return new Error('Invalid location data provided.');
    }
    
    if (error?.message) {
      return new Error(error.message);
    }
    
    return new Error('Failed to process location request. Please try again.');
  }
}

// Export convenience functions
export const locationsService = {
  getLocations: LocationsService.getLocations,
  getLocation: LocationsService.getLocation,
  searchLocations: LocationsService.searchLocations,
  getNearbyLocations: LocationsService.getNearbyLocations,
  getLocationsByCategory: LocationsService.getLocationsByCategory,
  getPopularLocations: LocationsService.getPopularLocations,
  getTrendingLocations: LocationsService.getTrendingLocations,
  getLocationSuggestions: LocationsService.getLocationSuggestions,
  getLocationCategories: LocationsService.getLocationCategories,
  getLocationsByCoordinates: LocationsService.getLocationsByCoordinates,
  getLocationStats: LocationsService.getLocationStats,
};
