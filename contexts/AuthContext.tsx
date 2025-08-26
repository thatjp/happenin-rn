import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { apiClient, authService } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isTestMode: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  invalidateToken: () => Promise<void>;
  enableTestMode: () => void;
  disableTestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const invalidateToken = async () => {
    try {
      // Clear tokens without making a server call
      await authService.clearTokens();
    } catch (error) {
      console.error('Token invalidation failed:', error);
    } finally {
      setIsAuthenticated(false);
      setIsTestMode(false);
      router.replace('/login');
    }
  };

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Set up token invalidation callback after auth context is initialized
  useEffect(() => {
    apiClient.setTokenInvalidationCallback(invalidateToken);
  }, []);

  // Check if user should be redirected
  useEffect(() => {
    if (isLoading) return;
    
    // Make sure segments are available
    if (!segments || segments.length < 1) {
      console.log('Segments not available yet, waiting...');
      return;
    }

    const currentRoute = segments[0];
    const isOnLoginScreen = currentRoute === 'login';
    const isOnRegisterScreen = currentRoute === 'register';
    const isInTabsGroup = currentRoute === '(tabs)';

    console.log('Auth navigation check:', {
      currentRoute,
      isOnLoginScreen,
      isOnRegisterScreen,
      isInTabsGroup,
      isAuthenticated,
      isTestMode,
      isLoading,
      segments
    });

    if (!isAuthenticated && !isTestMode && !isOnLoginScreen && !isOnRegisterScreen) {
      // User is not authenticated and not in test mode, redirect to login
      console.log('Redirecting to login');
      router.replace('/login');
    } else if ((isAuthenticated || isTestMode) && (isOnLoginScreen || isOnRegisterScreen)) {
      // User is authenticated or in test mode, redirect to main app index page
      console.log('Redirecting to tabs from auth screen');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isTestMode, segments, isLoading, router]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has a token
      const hasToken = await authService.hasToken();
      
      if (hasToken) {
        // If we have a token, consider the user authenticated
        // We'll validate the token on the first API call that requires it
        setIsAuthenticated(true);
        console.log('User has token, setting as authenticated');
      } else {
        setIsAuthenticated(false);
        console.log('No token found, user not authenticated');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't automatically log out on errors, just set as not authenticated
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string) => {
    try {
      // Store the token securely using the auth service
      // The token should already be stored by the API client during login
      setIsAuthenticated(true);
      setIsTestMode(false);
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsAuthenticated(false);
      setIsTestMode(false);
      router.replace('/login');
    }
  };

  const enableTestMode = () => {
    console.log('enableTestMode called');
    console.log('Router available:', !!router);
    console.log('Current segments:', segments);
    
    setIsTestMode(true);
    setIsAuthenticated(false);
    console.log('Test mode enabled, states updated');
    
    // Force navigation to tabs as a fallback
    setTimeout(() => {
      console.log('Force navigating to tabs');
      try {
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }, 100);
  };

  const disableTestMode = () => {
    setIsTestMode(false);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isTestMode,
    isLoading,
    login,
    logout,
    invalidateToken,
    enableTestMode,
    disableTestMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
