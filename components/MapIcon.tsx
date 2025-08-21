import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface MapIconProps {
  lat: number;
  lng: number;
  icon?: string;
  onPress?: () => void;
  size?: number;
  color?: string;
}

export function MapIcon({ 
  lat, 
  lng, 
  icon = "📍", 
  onPress, 
  size = 40,
  color 
}: MapIconProps) {
  const colorScheme = useColorScheme();
  
  const themed = {
    cardBg: colorScheme === 'dark' ? '#1E1F20' : '#FFFFFF',
    cardBorder: colorScheme === 'dark' ? '#2A2C2E' : '#E2E4E8',
    tint: color || Colors[colorScheme ?? 'light'].tint,
  };

  // Convert lat/lng to screen coordinates (simplified - you may want to use a proper projection library)
  // This is a basic implementation - for precise positioning, consider using react-native-maps or a mapping library
  const getScreenPosition = () => {
    // Placeholder logic - in a real implementation, you'd convert GPS to screen coordinates
    // For now, we'll position it in the top-right area as an example
    return {
      top: 100 + (lat * 1000) % 200, // Simple hash-like positioning
      left: 50 + (lng * 1000) % 200,
    };
  };

  const position = getScreenPosition();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconOverlay,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top: position.top,
          left: position.left,
          opacity: pressed ? 0.7 : 1,
          backgroundColor: themed.cardBg,
          borderColor: themed.cardBorder,
        }
      ]}>
      <ThemedText style={[styles.iconText, { color: themed.tint, fontSize: size * 0.5 }]}>
        {icon}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconOverlay: {
    position: 'absolute',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    textAlign: 'center',
  },
});
