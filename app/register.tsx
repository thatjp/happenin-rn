import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { authService } from '@/lib/api';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!username.trim()) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (!firstName.trim()) return 'First name is required';
    if (!lastName.trim()) return 'Last name is required';
    if (!email.trim()) return 'Email is required';
    if (!email.includes('@')) return 'Please enter a valid email address';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  }

  async function handleRegister() {
    const error = validate();
    if (error) {
      Alert.alert('Invalid input', error);
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('Submitting registration with data:', {
        email: email.trim(),
        password,
        password_confirm: password,
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      
      // Call the real registration service
      const authResponse = await authService.register({
        email: email.trim(),
        password,
        password_confirm: password,
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      
      console.log('Registration response received:', authResponse);
      
      // Check if we have a valid response with token
      if (authResponse && authResponse.token) {
        console.log('Registration successful, logging in user...');
        
        // Login the user with the received token
        login(authResponse.token);
        
        Alert.alert(
          'Registration Successful', 
          'Your account has been created successfully! Welcome to Happenin.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigation will be handled by AuthContext
                console.log('Registration successful, user logged in');
              },
            }
          ]
        );
      } else {
        console.error('Invalid registration response:', authResponse);
        throw new Error('Registration failed - invalid response from server');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      Alert.alert('Registration failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToLogin() {
    router.replace('/login');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
          <ThemedText style={styles.subtitle}>Enter your details to get started</ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <TextInput
              value={username}
              onChangeText={setUsername}
              inputMode="text"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Choose a username"
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
            <ThemedText style={styles.label}>First Name</ThemedText>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              inputMode="text"
              autoCapitalize="words"
              autoCorrect={false}
              placeholder="Enter your first name"
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
            <ThemedText style={styles.label}>Last Name</ThemedText>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              inputMode="text"
              autoCapitalize="words"
              autoCorrect={false}
              placeholder="Enter your last name"
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
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              inputMode="email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Enter your email"
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
              placeholder="Create a password"
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
            <ThemedText style={styles.label}>Confirm Password</ThemedText>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm your password"
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
            onPress={handleRegister} 
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: themed.tint, opacity: pressed || isSubmitting ? 0.85 : 1 },
            ]} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.buttonText}>Create Account</ThemedText>
            )}
          </Pressable>

          <View style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: themed.placeholder }]}>
              Already have an account?{' '}
            </ThemedText>
            <Pressable onPress={handleBackToLogin}>
              <ThemedText type="link">Sign in</ThemedText>
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});
