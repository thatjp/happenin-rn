import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { authService } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isTestMode: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
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

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
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
    const isInTabsGroup = currentRoute === '(tabs)';

    console.log('Auth navigation check:', {
      currentRoute,
      isOnLoginScreen,
      isInTabsGroup,
      isAuthenticated,
      isTestMode,
      isLoading,
      segments
    });

    if (!isAuthenticated && !isTestMode && !isOnLoginScreen) {
      // User is not authenticated and not in test mode, redirect to login
      console.log('Redirecting to login');
      router.replace('/login');
    } else if ((isAuthenticated || isTestMode) && isOnLoginScreen) {
      // User is authenticated or in test mode, redirect to main app index page
      console.log('Redirecting to tabs from login');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isTestMode, segments, isLoading, router]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has a valid token
      const hasToken = authService.isAuthenticated();
      
      if (hasToken) {
        // Verify token is still valid by trying to get current user
        try {
          await authService.getCurrentUser();
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear it
          await authService.logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string) => {
    setIsAuthenticated(true);
    setIsTestMode(false);
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
    enableTestMode,
    disableTestMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
