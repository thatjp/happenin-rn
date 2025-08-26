# Secure Token Storage with react-native-keychain

This document describes the secure token storage system implemented in the Happenin mobile app using `react-native-keychain`.

## Overview

The app now uses `react-native-keychain` to securely store authentication tokens (access tokens and refresh tokens) in the device's secure storage, rather than storing them in memory or insecure storage.

## Architecture

### Components

1. **KeychainTokenStorage** (`lib/api/storage/KeychainTokenStorage.ts`)
   - Implements the `TokenStorage` interface
   - Uses `react-native-keychain` for secure storage
   - Handles biometric authentication when available
   - Stores tokens with device passcode/biometric protection

2. **FallbackTokenStorage** (`lib/api/storage/index.ts`)
   - In-memory fallback when keychain is not available
   - Used for development/testing or when keychain fails

3. **useSecureStorage Hook** (`hooks/useSecureStorage.ts`)
   - Initializes secure storage on app startup
   - Automatically selects the best available storage method
   - Updates the API client with the selected storage

4. **TokenManager** (`lib/api/utils/tokenManager.ts`)
   - Utility class for token operations
   - Provides convenient methods for storing/clearing tokens

### Security Features

- **Biometric Authentication**: Tokens are protected by device biometrics (fingerprint/face ID) when available
- **Device Passcode Fallback**: Falls back to device passcode if biometrics are not available
- **Secure Storage**: Uses iOS Keychain and Android Keystore under the hood
- **Automatic Cleanup**: Tokens are automatically cleared on logout

## Usage

### Automatic Token Storage

Tokens are automatically stored when users log in or register:

```typescript
// During login/register, tokens are automatically stored by the API client
const response = await authService.login(credentials);
// Token is automatically stored securely in the background
```

### Manual Token Management

You can also manually manage tokens using the `TokenManager`:

```typescript
import { TokenManager } from '@/lib/api';

// Store tokens manually
await TokenManager.storeTokens(accessToken, refreshToken);

// Check if user has valid tokens
const hasTokens = await TokenManager.hasValidTokens();

// Get current access token
const token = await TokenManager.getAccessToken();

// Clear all tokens
await TokenManager.clearTokens();
```

### Checking Authentication Status

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { isAuthenticated, isLoading } = useAuth();

if (isLoading) {
  // Still checking authentication status
} else if (isAuthenticated) {
  // User is authenticated
} else {
  // User needs to log in
}
```

## Configuration

### Keychain Settings

The keychain is configured with the following security settings:

- **Access Control**: `BIOMETRIC_ANY_OR_DEVICE_PASSCODE`
- **Accessibility**: `WHEN_UNLOCKED` (tokens only accessible when device is unlocked)
- **Authentication Type**: `BIOMETRICS`

### Fallback Behavior

If the keychain is not available (e.g., during development, testing, or on unsupported devices), the app automatically falls back to in-memory storage. This ensures the app continues to function while providing a clear indication of the security level.

## Security Considerations

1. **Token Expiration**: Access tokens should have reasonable expiration times
2. **Refresh Token Rotation**: Refresh tokens should be rotated regularly
3. **Biometric Availability**: The app gracefully handles cases where biometrics are not available
4. **Secure Communication**: Tokens are transmitted over HTTPS only
5. **Automatic Cleanup**: Tokens are automatically cleared on logout or app uninstall

## Troubleshooting

### Common Issues

1. **Keychain Not Available**
   - Check if the device supports keychain
   - Verify biometric permissions are granted
   - Check for any keychain configuration issues

2. **Token Storage Fails**
   - Ensure the device is unlocked
   - Check if biometric authentication is working
   - Verify keychain permissions in app configuration

3. **Fallback Storage Used**
   - This is normal behavior when keychain is not available
   - Check console logs for keychain availability status
   - Ensure the app continues to function normally

### Debug Information

The app logs keychain status and token operations:

```typescript
// Check if keychain is available
import { useSecureStorage } from '@/hooks/useSecureStorage';

const { isKeychainAvailable } = useSecureStorage();
console.log('Keychain available:', isKeychainAvailable);
```

## Migration

### From Previous Storage

If you were previously using a different token storage method:

1. The new system automatically handles migration
2. Old tokens are not automatically migrated (users will need to log in again)
3. The API client automatically uses the new storage system

### Testing

To test the secure storage system:

1. **Development**: Use the test mode or fallback storage
2. **Production**: Ensure biometric permissions are properly configured
3. **Simulator**: Keychain may not work in iOS Simulator; use a real device for testing

## Best Practices

1. **Always use HTTPS** for token transmission
2. **Implement token refresh** logic for long-lived sessions
3. **Handle biometric failures** gracefully
4. **Test on real devices** when possible
5. **Monitor keychain availability** and fallback usage
6. **Clear tokens** on logout and app uninstall
7. **Handle network errors** during token operations

## Dependencies

- `react-native-keychain`: ^10.0.0
- `expo-secure-store`: ^14.2.3 (fallback for Expo managed workflow)

## Support

For issues related to secure token storage:

1. Check the console logs for keychain status
2. Verify device biometric settings
3. Test on different device types
4. Review keychain configuration in native code
