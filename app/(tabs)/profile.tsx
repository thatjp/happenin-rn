import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileScreen() {
  const { logout, isTestMode, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();

  const themed = {
    background: Colors[colorScheme ?? 'light'].background,
    text: Colors[colorScheme ?? 'light'].text,
    tint: Colors[colorScheme ?? 'light'].tint,
    cardBg: colorScheme === 'dark' ? '#1E1F20' : '#FFFFFF',
    cardBorder: colorScheme === 'dark' ? '#2A2C2E' : '#E2E4E8',
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Profile</ThemedText>
        <ThemedText style={styles.subtitle}>
          {isTestMode ? 'Test Mode Active' : 'User Account'}
        </ThemedText>
      </View>

      <View style={styles.card}>
        <View style={styles.statusSection}>
          <ThemedText style={styles.statusLabel}>Authentication Status</ThemedText>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isAuthenticated || isTestMode ? '#4CAF50' : '#F44336' }]} />
            <ThemedText style={styles.statusText}>
              {isTestMode ? 'Test Mode' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.infoLabel}>Account Information</ThemedText>
          <ThemedText style={styles.infoText}>
            {isTestMode 
              ? 'You are currently using the app in test mode. No authentication is required.'
              : isAuthenticated 
                ? 'You are logged in with a valid account.'
                : 'Please log in to access your account.'
            }
          </ThemedText>
        </View>

        <Pressable 
          onPress={handleLogout} 
          style={({ pressed }) => [
            styles.logoutButton,
            { 
              backgroundColor: '#F44336',
              opacity: pressed ? 0.85 : 1 
            },
          ]}
        >
          <ThemedText style={styles.logoutButtonText}>
            {isTestMode ? 'Exit Test Mode' : 'Sign Out'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#687076',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusSection: {
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#687076',
  },
  logoutButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
