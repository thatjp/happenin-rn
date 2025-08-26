import { apiClient } from '@/lib/api/client';
import { getTokenStorage } from '@/lib/api/storage';
import { useEffect, useState } from 'react';

export function useSecureStorage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isKeychainAvailable, setIsKeychainAvailable] = useState(false);

  useEffect(() => {
    initializeSecureStorage();
  }, []);

  const initializeSecureStorage = async () => {
    try {
      console.log('Initializing secure token storage...');
      
      // Get the best available token storage (keychain or fallback)
      const tokenStorage = await getTokenStorage();
      
      // Update the API client to use the new token storage
      apiClient.setTokenStorage(tokenStorage);
      
      // Check if keychain is available
      const keychainAvailable = tokenStorage.constructor.name === 'KeychainTokenStorage';
      setIsKeychainAvailable(keychainAvailable);
      
      if (keychainAvailable) {
        console.log('Secure token storage initialized with Keychain');
      } else {
        console.log('Secure token storage initialized with fallback storage');
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize secure token storage:', error);
      setIsInitialized(true); // Still mark as initialized to prevent blocking
    }
  };

  return {
    isInitialized,
    isKeychainAvailable,
  };
}
