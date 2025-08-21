import { apiClient } from '../client';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile
} from '../types';

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.login(credentials.email, credentials.password);
      return response.data as AuthResponse;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Register a new user account
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      const data = response.data;
      
      if (data.success && data.data?.token) {
        // Store tokens after successful registration
        // Note: The apiClient.login method handles token storage
        // We need to manually set them here for registration
        // This is a bit of a hack - ideally the API client would handle this
        const authData = data.data as AuthResponse;
        // You might want to create a method in apiClient to handle this
      }
      
      return data.data as AuthResponse;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout the current user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.logout();
    } catch (error) {
      // Even if logout fails on the server, clear local tokens
      console.warn('Logout failed on server, but local tokens cleared:', error);
    }
  }

  /**
   * Refresh the access token
   */
  static async refreshToken(): Promise<string | null> {
    try {
      return await apiClient.refreshToken();
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get the current user's profile
   */
  static async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>('/users/profile');
      return response.data.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update the current user's profile
   */
  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.patch<ApiResponse<UserProfile>>('/users/profile/update', updates);
      return response.data.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email', { token });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Resend email verification
   */
  static async resendEmailVerification(): Promise<void> {
    try {
      await apiClient.post('/auth/resend-verification');
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    return apiClient.getAccessToken();
  }

  /**
   * Handle authentication errors
   */
  private static handleAuthError(error: any): Error {
    if (error?.status === 401) {
      return new Error('Invalid credentials. Please check your email and password.');
    }
    
    if (error?.status === 403) {
      return new Error('Access denied. Please verify your account.');
    }
    
    if (error?.status === 422) {
      return new Error('Invalid data provided. Please check your input.');
    }
    
    if (error?.status === 429) {
      return new Error('Too many attempts. Please try again later.');
    }
    
    if (error?.message) {
      return new Error(error.message);
    }
    
    return new Error('Authentication failed. Please try again.');
  }
}

// Export convenience functions
export const authService = {
  login: AuthService.login,
  register: AuthService.register,
  logout: AuthService.logout,
  refreshToken: AuthService.refreshToken,
  getCurrentUser: AuthService.getCurrentUser,
  updateProfile: AuthService.updateProfile,
  changePassword: AuthService.changePassword,
  requestPasswordReset: AuthService.requestPasswordReset,
  resetPassword: AuthService.resetPassword,
  verifyEmail: AuthService.verifyEmail,
  resendEmailVerification: AuthService.resendEmailVerification,
  isAuthenticated: AuthService.isAuthenticated,
  getAccessToken: AuthService.getAccessToken,
};
