import { apiClient } from '../client';
import {
  ApiResponse,
  Event,
  EventCreateRequest,
  EventUpdateRequest,
  PaginatedResponse,
  SearchFilters,
  SearchRequest
} from '../types';

export class EventsService {
  /**
   * Get all events with pagination
   */
  static async getEvents(page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>('/events', {
        page,
        limit,
      });
      console.log('Events:', response.data);
      return response?.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Get a specific event by ID
   */
  static async getEvent(id: string): Promise<Event> {
    try {
      const response = await apiClient.get<ApiResponse<Event>>(`/events/${id}`);
      return response.data.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Create a new event
   */
  static async createEvent(eventData: EventCreateRequest): Promise<Event> {
    try {
      const response = await apiClient.post<ApiResponse<Event>>('/events/create', eventData);
      return response.data.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Update an existing event
   */
  static async updateEvent(id: string, updates: EventUpdateRequest): Promise<Event> {
    try {
      const response = await apiClient.put<ApiResponse<Event>>(`/events/${id}/update`, updates);
      return response.data.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Delete an event
   */
  static async deleteEvent(id: string): Promise<void> {
    try {
      await apiClient.delete(`/events/${id}/delete`);
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Search events with filters
   */
  static async searchEvents(filters: SearchFilters, page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    try {
      const searchRequest: SearchRequest = {
        filters,
        page,
        limit,
        sortBy: 'date',
        sortOrder: 'asc',
      };
      
      const response = await apiClient.post<PaginatedResponse<Event>>('/events/search', searchRequest);
      return response.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Get events near a specific location
   */
  static async getNearbyEvents(
    latitude: number, 
    longitude: number, 
    radius = 10, // km
    page = 1, 
    limit = 20
  ): Promise<PaginatedResponse<Event>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>('/events/nearby', {
        latitude,
        longitude,
        radius,
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Get events by category
   */
  static async getEventsByCategory(category: string, page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>('/events', {
        category,
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Get events by organizer
   */
  static async getEventsByOrganizer(organizerId: string, page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>('/events', {
        organizerId,
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    try {
      const now = new Date().toISOString();
      const response = await apiClient.get<PaginatedResponse<Event>>('/events', {
        startTime: now,
        page,
        limit,
        sortBy: 'date',
        sortOrder: 'asc',
      });
      return response.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Attend an event
   */
  static async attendEvent(eventId: string): Promise<void> {
    try {
      await apiClient.post(`/events/${eventId}/attend`);
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Unattend an event
   */
  static async unattendEvent(eventId: string): Promise<void> {
    try {
      await apiClient.post(`/events/${eventId}/unattend`);
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Check if user is attending an event
   */
  static async isAttendingEvent(eventId: string): Promise<boolean> {
    try {
      const event = await EventsService.getEvent(eventId);
      // This assumes the event object includes attendee information
      // You might need to adjust based on your API response structure
      return event.attendees.some(attendee => attendee.id === 'current-user-id'); // Replace with actual user ID
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user's attended events
   */
  static async getAttendedEvents(page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>('/events/attended', {
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Get popular events
   */
  static async getPopularEvents(page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>('/events/popular', {
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Get trending events
   */
  static async getTrendingEvents(page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Event>>('/events/trending', {
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      throw EventsService.handleEventError(error);
    }
  }

  /**
   * Handle event-specific errors
   */
  static handleEventError(error: any): Error {
    if (error?.status === 404) {
      return new Error('Event not found.');
    }
    
    if (error?.status === 403) {
      return new Error('You do not have permission to perform this action.');
    }
    
    if (error?.status === 409) {
      return new Error('Event already exists or conflict occurred.');
    }
    
    if (error?.status === 422) {
      return new Error('Invalid event data provided.');
    }
    
    if (error?.message) {
      return new Error(error.message);
    }
    
    return new Error('Failed to process event request. Please try again.');
  }
}

// Export convenience functions
export const eventsService = {
  getEvents: EventsService.getEvents,
  getEvent: EventsService.getEvent,
  createEvent: EventsService.createEvent,
  updateEvent: EventsService.updateEvent,
  deleteEvent: EventsService.deleteEvent,
  searchEvents: EventsService.searchEvents,
  getNearbyEvents: EventsService.getNearbyEvents,
  getEventsByCategory: EventsService.getEventsByCategory,
  getEventsByOrganizer: EventsService.getEventsByOrganizer,
  getUpcomingEvents: EventsService.getUpcomingEvents,
  attendEvent: EventsService.attendEvent,
  unattendEvent: EventsService.unattendEvent,
  isAttendingEvent: EventsService.isAttendingEvent,
  getAttendedEvents: EventsService.getAttendedEvents,
  getPopularEvents: EventsService.getPopularEvents,
  getTrendingEvents: EventsService.getTrendingEvents,
};
