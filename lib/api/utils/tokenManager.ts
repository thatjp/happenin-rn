import { apiClient } from '../client';
import { getTokenStorage } from '../storage';

/**
 * Token Manager utility class
 * Provides convenient methods for token operations
 */
export class TokenManager {
  /**
   * Store tokens securely after successful authentication
   */
  static async storeTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      const tokenStorage = await getTokenStorage();
      await tokenStorage.setAccessToken(accessToken);
      
      if (refreshToken) {
        await tokenStorage.setRefreshToken(refreshToken);
      }
      
      // Update the API client to use the new token storage
      apiClient.setTokenStorage(tokenStorage);
      
      console.log('Tokens stored securely');
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to securely store authentication tokens');
    }
  }

  /**
   * Clear all stored tokens
   */
  static async clearTokens(): Promise<void> {
    try {
      const tokenStorage = await getTokenStorage();
      await tokenStorage.clearTokens();
      
      // Update the API client to use the cleared token storage
      apiClient.setTokenStorage(tokenStorage);
      
      console.log('Tokens cleared');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      // Don't throw error as this is cleanup operation
    }
  }

  /**
   * Check if user has valid tokens
   */
  static async hasValidTokens(): Promise<boolean> {
    try {
      const tokenStorage = await getTokenStorage();
      const accessToken = await tokenStorage.getAccessToken();
      return !!accessToken;
    } catch (error) {
      console.warn('Failed to check token validity:', error);
      return false;
    }
  }

  /**
   * Get the current access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const tokenStorage = await getTokenStorage();
      return await tokenStorage.getAccessToken();
    } catch (error) {
      console.warn('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get the current refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const tokenStorage = await getTokenStorage();
      return await tokenStorage.getRefreshToken();
    } catch (error) {
      console.warn('Failed to get refresh token:', error);
      return null;
    }
  }
}
