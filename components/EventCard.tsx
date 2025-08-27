import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Event } from '@/lib/api';

interface EventCardProps {
  event: Event | null;
  isVisible: boolean;
  onClose: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

export function EventCard({ event, isVisible, onClose }: EventCardProps) {
  const colorScheme = useColorScheme();
  const safeAreaInsets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  
  // Animation values - separate native and JS-driven animations
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Drag gesture handling
  const dragAnim = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);

  // Animate card entrance and exit
  useEffect(() => {
    if (isVisible) {
      // Animate in with spring for natural movement
      Animated.parallel([
        Animated.sequence([
          Animated.delay(50), // Small delay to let opacity start first
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]),
        Animated.timing(cardOpacityAnim, {
          toValue: 100,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Animate out with smooth timing
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, cardOpacityAnim, backdropOpacityAnim]);

  if (!event || !isVisible) return null;

  const themed = {
    background: colorScheme === 'dark' ? '#1E1F20' : '#FFFFFF',
    border: colorScheme === 'dark' ? '#2A2C2E' : '#E2E4E8',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    secondaryText: colorScheme === 'dark' ? '#9BA1A6' : '#687076',
    accent: Colors[colorScheme ?? 'light'].tint,
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5); // Convert "19:00:00" to "19:00"
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handle drag gesture
  const handlePanGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationY, state } = event.nativeEvent;
    
    if (state === 2) { // ACTIVE - dragging
      isDragging.current = true;
      dragAnim.setValue(translationY);
    } else if (state === 5) { // END - gesture finished
      isDragging.current = false;
      
      // If dragged down more than 100px, close the card
      if (translationY > 100) {
        // Haptic feedback when closing
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onClose();
      } else {
        // Haptic feedback when snapping back
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Snap back to original position
        Animated.spring(dragAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  return (
    <>
      {/* Animated Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop, 
          { opacity: backdropOpacityAnim }
        ]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>
      
      {/* Animated Card */}
      <PanGestureHandler onGestureEvent={handlePanGesture}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: themed.background,
              borderColor: themed.border,
              transform: [
                { translateY: slideAnim },
                { translateY: dragAnim }
              ],
              opacity: cardOpacityAnim,
              bottom: safeAreaInsets.bottom + tabBarHeight, // Account for tab bar and safe area
              paddingBottom: 20 + safeAreaInsets.bottom, // Extra padding for safe area
            },
          ]}
        >
          {/* Handle bar */}
          <View style={[styles.handleBar, { backgroundColor: themed.secondaryText }]} />
        
        {/* Event Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <ThemedText style={[styles.title, { color: themed.text }]}>
              {event.title}
            </ThemedText>
            <View style={[styles.iconContainer, { backgroundColor: themed.accent }]}>
              <ThemedText style={styles.iconText}>🎵</ThemedText>
            </View>
          </View>
          
          <ThemedText style={[styles.eventType, { color: themed.accent }]}>
            {event.event_type}
          </ThemedText>
        </View>

        {/* Event Details */}
        <View style={styles.details}>
          {/* Date and Time */}
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: themed.secondaryText }]}>
              📅 Date
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: themed.text }]}>
              {formatDate(event.start_date)}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: themed.secondaryText }]}>
              🕒 Time
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: themed.text }]}>
              {formatTime(event.open_time)} - {formatTime(event.close_time)}
            </ThemedText>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: themed.secondaryText }]}>
              📍 Location
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: themed.text }]}>
              {event.city}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: themed.secondaryText }]}>
              🏠 Address
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: themed.text }]}>
              {event.full_address}
            </ThemedText>
          </View>

          {/* Price */}
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: themed.secondaryText }]}>
              💰 Price
            </ThemedText>
            <ThemedText style={[styles.detailValue, { color: themed.text }]}>
              {event.is_free ? 'Free' : `$${event.price}`}
            </ThemedText>
          </View>

          {/* Status */}
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: themed.secondaryText }]}>
              📊 Status
            </ThemedText>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: event.is_active ? '#4CAF50' : '#F44336' }]} />
              <ThemedText style={[styles.detailValue, { color: themed.text }]}>
                {event.is_active ? 'Active' : 'Inactive'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable 
            style={[styles.button, { backgroundColor: themed.accent }]}
            onPress={() => {
              // TODO: Navigate to event details
              console.log('View full details for event:', event.id);
            }}
          >
            <ThemedText style={styles.buttonText}>View Full Details</ThemedText>
          </Pressable>
          
          <Pressable 
            style={[styles.secondaryButton, { borderColor: themed.accent }]}
            onPress={() => {
              // TODO: Add to calendar
              console.log('Add to calendar:', event.id);
            }}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: themed.accent }]}>
              Add to Calendar
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>
      </PanGestureHandler>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999, // Above map but below card
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999, // Same as backdrop
  },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: screenHeight * 0.6, // Reduced from 0.7 to account for tab bar
    zIndex: 1000, // Ensure card appears above all other UI elements
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    // Make it more obvious it's draggable
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  details: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  actions: {
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
