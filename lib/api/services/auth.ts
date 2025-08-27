import { apiClient } from '../client';
import {
  ApiResponse,
  AuthApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile
} from '../types';

export class AuthService {
  /**
   * Authenticate user with email/username and password
   */
  static async login(credentials: LoginRequest): Promise<AuthApiResponse> {
    try {
      if (!credentials.email_or_username) {
        throw new Error('Email or username is required');
      }
      console.log('Login credentials:', credentials);
      console.log('Email or username:', credentials.email_or_username);
      
      const identifier = credentials.email_or_username || '';
      const response = await apiClient.login(identifier, credentials.password);
      console.log('Auth service received response:', response);
      
      // The API client returns AuthApiResponse, we need to extract the user data
      if (response?.success && response.user) {
        console.log('hit here 1')
        return response as AuthApiResponse;
      } else {
        console.log('hit here 2')
        throw new Error(response?.message || 'Login failed - invalid response structure');
      }
    } catch (error) {
      throw AuthService.handleAuthError(error);
    }
  }

  /**
   * Register a new user account
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    console.log('Registering user:', userData);
    try {
      const response = await apiClient.post<any>('/accounts/register/', userData);
      console.log('Registration response:', response);
      
      const data = response.data;
      
      // Check if data exists and has the expected structure
      if (!data) {
        throw new Error('No response data received from registration');
      }
      
      // Handle the response structure
      if (data.success && data.token) {
        console.log('Registration successful with token');
        
        // Store the token in the API client's token storage
        await apiClient.setAccessToken(data.token);
        if (data.refreshToken) {
          await apiClient.setRefreshToken(data.refreshToken);
        }
        
        // Create AuthResponse from the actual response structure
        const authResponse: AuthResponse = {
          user: {
            id: data.user.id.toString(),
            email: data.user.email,
            username: data.user.username,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            avatar: undefined, // API doesn't provide avatar in registration
            createdAt: data.user.created_at,
            updatedAt: data.user.updated_at
          },
          token: data.token,
          refreshToken: data.refreshToken || '',
          success: data.success,
          message: data.message
        };
        
        return authResponse;
      } else {
        console.error('Unexpected response structure:', data);
        throw new Error(data.message || 'Registration failed - unexpected response format');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw AuthService.handleAuthError(error);
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
   * Clear tokens without making a server call
   * Used when tokens are invalid or expired
   */
  static async clearTokens(): Promise<void> {
    try {
      await apiClient.clearTokens();
    } catch (error) {
      console.warn('Failed to clear tokens:', error);
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
      await apiClient.post('/accounts/forgot-password', { email });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/accounts/reset-password', {
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
      await apiClient.post('/accounts/verify-email', { token });
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Resend email verification
   */
  static async resendEmailVerification(): Promise<void> {
    try {
      await apiClient.post('/accounts/resend-verification');
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    return await apiClient.isAuthenticated();
  }

  /**
   * Check if user has a token (without validating it)
   */
  static async hasToken(): Promise<boolean> {
    try {
      const token = await apiClient.getAccessToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current access token
   */
  static async getAccessToken(): Promise<string | null> {
    return await apiClient.getAccessToken();
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
  clearTokens: AuthService.clearTokens,
  refreshToken: AuthService.refreshToken,
  getCurrentUser: AuthService.getCurrentUser,
  updateProfile: AuthService.updateProfile,
  changePassword: AuthService.changePassword,
  requestPasswordReset: AuthService.requestPasswordReset,
  resetPassword: AuthService.resetPassword,
  verifyEmail: AuthService.verifyEmail,
  resendEmailVerification: AuthService.resendEmailVerification,
  isAuthenticated: AuthService.isAuthenticated,
  hasToken: AuthService.hasToken,
  getAccessToken: AuthService.getAccessToken,
};
