import { API_CONFIG, API_STATUS, buildApiUrl } from './config';
import { ApiResponse } from './types';

// Request options interface
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

// Response wrapper
interface ApiClientResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
}

// Error class for API errors
export class ApiClientError extends Error {
  public status: number;
  public code: string;
  public details?: Record<string, any>;

  constructor(message: string, status: number, code: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Token storage interface
interface TokenStorage {
  getAccessToken(): string | null;
  setAccessToken(token: string): void;
  getRefreshToken(): string | null;
  setRefreshToken(token: string): void;
  clearTokens(): void;
}

// Default token storage using AsyncStorage
class DefaultTokenStorage implements TokenStorage {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

// Main API Client class
export class ApiClient {
  private tokenStorage: TokenStorage;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(tokenStorage?: TokenStorage) {
    this.tokenStorage = tokenStorage || new DefaultTokenStorage();
  }

  // Main request method
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiClientResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.MAX_RETRIES,
      signal,
    } = options;

    const url = buildApiUrl(endpoint);
    const requestHeaders = await this.buildHeaders(headers);

    // Add authentication header if token exists
    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }

    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Combine user signal with timeout signal
        if (signal) {
          signal.addEventListener('abort', () => controller.abort());
        }

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle authentication errors
        if (response.status === API_STATUS.UNAUTHORIZED && attempt === 0) {
          const newToken = await this.handleTokenRefresh();
          if (newToken) {
            // Retry with new token
            requestHeaders.Authorization = `Bearer ${newToken}`;
            continue;
          }
        }

        // Parse response
        const responseData = await this.parseResponse<T>(response);
        
        return {
          data: responseData,
          status: response.status,
          headers: response.headers,
          ok: response.ok,
        };

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof ApiClientError && 
            (error.status === API_STATUS.BAD_REQUEST || 
             error.status === API_STATUS.UNAUTHORIZED ||
             error.status === API_STATUS.FORBIDDEN)) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  // Helper methods for different HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiClientResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data });
  }

  async delete<T>(endpoint: string): Promise<ApiClientResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    const response = await this.post('/auth/login', { email, password });
    const data = response.data as ApiResponse<any>;
    
    if (data.success && data.data?.token) {
      this.tokenStorage.setAccessToken(data.data.token);
      this.tokenStorage.setRefreshToken(data.data.refreshToken);
    }
    
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } finally {
      this.tokenStorage.clearTokens();
    }
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await this.post('/auth/refresh', { refreshToken });
      const data = response.data as ApiResponse<any>;
      
      if (data.success && data.data?.token) {
        this.tokenStorage.setAccessToken(data.data.token);
        this.tokenStorage.setRefreshToken(data.data.refreshToken);
        return data.data.token;
      }
    } catch (error) {
      this.tokenStorage.clearTokens();
    }
    
    return null;
  }

  // Private helper methods
  private async buildHeaders(customHeaders: Record<string, string>): Promise<Record<string, string>> {
    return {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...customHeaders,
    };
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiClientError(
          data.message || 'Request failed',
          response.status,
          data.code || 'UNKNOWN_ERROR',
          data.details
        );
      }
      
      return data;
    }
    
    if (!response.ok) {
      throw new ApiClientError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        'HTTP_ERROR'
      );
    }
    
    return response.text() as T;
  }

  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshToken();
    
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.tokenStorage.getAccessToken();
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  setTokenStorage(storage: TokenStorage): void {
    this.tokenStorage = storage;
  }
}

// Export default instance
export const apiClient = new ApiClient();
