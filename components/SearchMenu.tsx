import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SearchMenuProps {
  style?: any;
}

interface MenuOption {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

export function SearchMenu({ style }: SearchMenuProps) {
  const colorScheme = useColorScheme();
  const [isPressed, setIsPressed] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const themed = {
    background: colorScheme === 'dark' ? '#1E1F20' : '#FFFFFF',
    border: colorScheme === 'dark' ? '#2A2C2E' : '#E2E4E8',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    secondaryText: colorScheme === 'dark' ? '#9BA1A6' : '#687076',
    accent: Colors[colorScheme ?? 'light'].tint,
    hoverBackground: colorScheme === 'dark' ? '#2A2C2E' : '#F8F9FA',
  };

  const menuOptions: MenuOption[] = [
    {
      id: 'search',
      icon: '🔍',
      label: 'Search Events',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('Search Events pressed');
        setIsMenuVisible(false);
        // TODO: Implement search functionality
      },
    },
    {
      id: 'filter',
      icon: '⚡',
      label: 'Quick Filters',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('Quick Filters pressed');
        setIsMenuVisible(false);
        // TODO: Implement filter functionality
      },
    },
    {
      id: 'nearby',
      icon: '📍',
      label: 'Nearby',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('Nearby pressed');
        setIsMenuVisible(false);
        // TODO: Implement filter functionality
      },
    },
    {
      id: 'favorites',
      icon: '❤️',
      label: 'Favorites',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('Favorites pressed');
        setIsMenuVisible(false);
        // TODO: Implement filter functionality
      },
    },
  ];

  const handlePressIn = () => {
    setIsPressed(true);
    setIsMenuVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    // Don't hide menu on press out - let user slide to options
  };

  const handleSearchButtonPress = () => {
    // Only hide menu if no option was selected
    if (isMenuVisible) {
      setIsMenuVisible(false);
    }
  };

  const handleMenuOptionPress = (option: MenuOption) => {
    option.onPress();
    // Menu will be hidden by the option's onPress
  };

  return (
    <View style={[styles.container, style]}>
      {/* Menu Options - appear above the search icon */}
      {isMenuVisible && (
        <View style={[styles.menuContainer, { backgroundColor: themed.background, borderColor: themed.border }]}>
          {menuOptions.map((option, index) => (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.menuOption,
                { 
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: hoveredOption === option.id ? themed.hoverBackground : 'transparent',
                },
                index === 0 && styles.firstMenuOption,
                index === menuOptions.length - 1 && styles.lastMenuOption,
              ]}
              onPress={() => handleMenuOptionPress(option)}
              onPressIn={() => setHoveredOption(option.id)}
              onPressOut={() => setHoveredOption(null)}
            >
              <ThemedText style={styles.menuIcon}>{option.icon}</ThemedText>
              <ThemedText style={[styles.menuLabel, { color: themed.text }]}>
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}

      {/* Search Icon Button */}
      <Pressable
        style={({ pressed }) => [
          styles.searchButton,
          {
            backgroundColor: isPressed || isMenuVisible ? themed.accent : themed.background,
            borderColor: themed.border,
            transform: [{ scale: isPressed ? 0.95 : 1 }],
          },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleSearchButtonPress}
        accessibilityRole="button"
        accessibilityLabel="Search menu"
      >
        <ThemedText style={[styles.searchIcon, { color: isPressed || isMenuVisible ? '#FFFFFF' : themed.accent }]}>
          🔍
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 60, // Position above the search icon
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 160,
    transform: [{ scale: 1 }], // Will be animated
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  firstMenuOption: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  lastMenuOption: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  searchButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 24,
  },
});
