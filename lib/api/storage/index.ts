export { KeychainTokenStorage, TokenStorage } from './KeychainTokenStorage';

// Export a function to get the best available token storage
export async function getTokenStorage(): Promise<TokenStorage> {
  try {
    // Check if keychain is available
    if (await KeychainTokenStorage.isAvailable()) {
      return new KeychainTokenStorage();
    }
  } catch (error) {
    console.warn('Keychain not available, using fallback storage:', error);
  }
  
  // Fallback to a simple in-memory storage (not secure, but functional)
  // This should only be used when keychain is not available
  return new FallbackTokenStorage();
}

// Fallback token storage for when keychain is not available
class FallbackTokenStorage implements TokenStorage {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async getAccessToken(): Promise<string | null> {
    return this.accessToken;
  }

  async setAccessToken(token: string): Promise<void> {
    this.accessToken = token;
  }

  async getRefreshToken(): Promise<string | null> {
    return this.refreshToken;
  }

  async setRefreshToken(token: string): Promise<void> {
    this.refreshToken = token;
  }

  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
  }
}
