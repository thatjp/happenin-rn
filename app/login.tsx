import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { authService, LoginRequest } from '@/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const { login, enableTestMode } = useAuth();
  const colorScheme = useColorScheme();
  const [identifier, setIdentifier] = useState(''); // Username or email
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const themed = useMemo(() => {
    const scheme = colorScheme ?? 'light';
    return {
      background: Colors[scheme].background,
      text: Colors[scheme].text,
      tint: Colors[scheme].tint,
      inputBackground: scheme === 'dark' ? '#1E1F20' : '#F2F3F5',
      inputBorder: scheme === 'dark' ? '#2A2C2E' : '#E2E4E8',
      placeholder: scheme === 'dark' ? '#9BA1A6' : '#687076',
      error: scheme === 'dark' ? '#FF6B6B' : '#E74C3C',
    };
  }, [colorScheme]);

  function validate(): string | null {
    if (!identifier.trim()) return 'Username or email is required';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  }

  async function handleLogin() {
    const error = validate();
    if (error) {
      Alert.alert('Invalid input', error);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Determine if identifier is email or username
      const loginData: LoginRequest = {
        password,
        email_or_username: identifier,
      };

      // Attempt to authenticate
      const response = await authService.login(loginData);
      console.log('Login response:', response);
      
      // Check if we have a valid response with token
      if (response && response.token) {
        // Update auth context and navigate
        console.log('Login successful, token received');
        login(response.token);
        // Navigation will be handled by AuthContext
      } else {
        console.log('Login failed - no token in response');
        Alert.alert('Login failed', 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      Alert.alert('Login failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTestLogin() {
    try {
      setIsTesting(true);
      
      // Simulate a brief loading state for testing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Enable test mode in auth context
      enableTestMode();
      
      // Fallback navigation in case auth context doesn't work
      setTimeout(() => {
        console.log('Login screen fallback navigation');
        router.replace('/(tabs)');
      }, 200);
      
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Test login error:', error);
      Alert.alert('Test login failed', 'Unable to bypass authentication for testing.');
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
          <ThemedText style={styles.subtitle}>Sign in to continue to Happenin</ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Username or Email</ThemedText>
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              inputMode="text"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Enter username or email"
              placeholderTextColor={themed.placeholder}
              style={[
                styles.input,
                {
                  color: themed.text,
                  backgroundColor: themed.inputBackground,
                  borderColor: themed.inputBorder,
                },
              ]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor={themed.placeholder}
              style={[
                styles.input,
                {
                  color: themed.text,
                  backgroundColor: themed.inputBackground,
                  borderColor: themed.inputBorder,
                },
              ]}
            />
          </View>

          <Pressable 
            onPress={handleLogin} 
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: themed.tint, opacity: pressed || isSubmitting ? 0.85 : 1 },
            ]} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.buttonText}>Sign In</ThemedText>
            )}
          </Pressable>

          <Pressable onPress={() => Alert.alert('Forgot password', 'This feature is coming soon.')} style={styles.linkRow}>
            <ThemedText type="link">Forgot password?</ThemedText>
          </Pressable>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: themed.inputBorder }]} />
            <ThemedText style={[styles.dividerText, { color: themed.placeholder }]}>or</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: themed.inputBorder }]} />
          </View>

          <Pressable 
            onPress={handleTestLogin} 
            style={({ pressed }) => [
              styles.testButton,
              { 
                borderColor: themed.tint, 
                opacity: pressed || isTesting ? 0.85 : 1 
              },
            ]} 
            disabled={isTesting}
          >
            {isTesting ? (
              <ActivityIndicator color={themed.tint} size="small" />
            ) : (
              <ThemedText style={[styles.testButtonText, { color: themed.tint }]}>
                🚀 Test Mode - Skip Login
              </ThemedText>
            )}
          </Pressable>

          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: themed.placeholder }]}>
              Don&apos;t have an account?{' '}
            </ThemedText>
            <Pressable onPress={() => {
              console.log('Sign up pressed, attempting navigation...');
              console.log('Current route info:', {
                canGoBack: router.canGoBack()
              });
              
              // Try using the href approach with window.location as fallback
              try {
                console.log('Trying router.push with /register...');
                router.push('/register');
              } catch (error) {
                console.error('router.push failed:', error);
                try {
                  console.log('Trying router.replace with /register...');
                  router.replace('/register');
                } catch (error2) {
                  console.error('router.replace failed:', error2);
                  // Last resort: try to navigate to the file directly
                  console.log('Trying to navigate to register file...');
                  router.push('/register');
                }
              }
            }}>
              <ThemedText type="link">Sign up</ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'left',
  },
  subtitle: {
    color: '#687076',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  testButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E4E8', // Default border color
    marginTop: 6,
  },
  testButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
  },
});


