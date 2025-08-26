import * as Keychain from 'react-native-keychain';

// Token storage interface
export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  setAccessToken(token: string): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  clearTokens(): Promise<void>;
}

// Secure token storage using react-native-keychain
export class KeychainTokenStorage implements TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'happenin_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'happenin_refresh_token';

  /**
   * Get the stored access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword(KeychainTokenStorage.ACCESS_TOKEN_KEY);
      return credentials ? credentials.password : null;
    } catch (error) {
      console.warn('Failed to retrieve access token from keychain:', error);
      return null;
    }
  }

  /**
   * Store the access token securely
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      await Keychain.setGenericPassword(
        KeychainTokenStorage.ACCESS_TOKEN_KEY,
        token,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRIC_ANY_OR_DEVICE_PASSCODE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
          authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
        }
      );
    } catch (error) {
      console.error('Failed to store access token in keychain:', error);
      throw new Error('Failed to securely store access token');
    }
  }

  /**
   * Get the stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword(KeychainTokenStorage.REFRESH_TOKEN_KEY);
      return credentials ? credentials.password : null;
    } catch (error) {
      console.warn('Failed to retrieve refresh token from keychain:', error);
      return null;
    }
  }

  /**
   * Store the refresh token securely
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await Keychain.setGenericPassword(
        KeychainTokenStorage.REFRESH_TOKEN_KEY,
        token,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRIC_ANY_OR_DEVICE_PASSCODE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
          authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
        }
      );
    } catch (error) {
      console.error('Failed to store refresh token in keychain:', error);
      throw new Error('Failed to securely store refresh token');
    }
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        Keychain.resetGenericPassword(KeychainTokenStorage.ACCESS_TOKEN_KEY),
        Keychain.resetGenericPassword(KeychainTokenStorage.REFRESH_TOKEN_KEY),
      ]);
    } catch (error) {
      console.warn('Failed to clear tokens from keychain:', error);
      // Don't throw error as this is cleanup operation
    }
  }

  /**
   * Check if keychain is available and working
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await Keychain.getSupportedBiometryType();
      return true;
    } catch (error) {
      console.warn('Keychain not available:', error);
      return false;
    }
  }
}
