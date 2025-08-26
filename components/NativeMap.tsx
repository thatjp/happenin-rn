import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DarkModeToggle } from "@/components/DarkModeToggle";
import { EventCard } from "@/components/EventCard";
import { SearchMenu } from "@/components/SearchMenu";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Event, eventsService } from "@/lib/api";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const DEFAULT_CENTER = { latitude: 40.717362, longitude: -73.964849 };
const DEFAULT_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export function NativeMap() {
  const colorScheme = useColorScheme();
  const safeAreaInsets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [useDarkStyle, setUseDarkStyle] = useState(colorScheme === "dark");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventCardVisible, setIsEventCardVisible] = useState(false);
  const [isCreateEventCardVisible, setIsCreateEventCardVisible] = useState(false);
  
  // Animation values for the sliding card
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  // Function to show the create event card
  const showCreateEventCard = () => {
    setIsCreateEventCardVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Function to hide the create event card
  const hideCreateEventCard = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setIsCreateEventCardVisible(false);
    });
  };

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsService.getEvents(1, 20);
      console.log('Full API Response:', response);
      
      // Set events from the response
      if (response.results && Array.isArray(response.results) && response.results.length > 0) {
        console.log('Events:', response.results);
        setEvents(response.results);
      } else {
        console.warn('No events returned from API, using fallback data');
        // Fallback data for testing when API is not available
        const fallbackEvents: Event[] = [
          {
            id: 1,
            title: 'Times Square Event',
            city: 'New York',
            event_type: 'Entertainment',
            full_address: 'Manhattan, NY 10036',
            icon: 'star',
            is_active: true,
            is_currently_open: false,
            is_free: false,
            is_open: true,
            open_time: '19:00:00',
            close_time: '23:00:00',
            start_date: '2024-08-26',
            end_date: '2024-08-26',
            price: '25.00',
            latitude: '40.717362',
            longitude: '-73.964849',
            lat_lng: { latitude: 40.717362, longitude: -73.964849 }
          },
          {
            id: 2,
            title: 'Central Park Gathering',
            city: 'New York',
            event_type: 'Social',
            full_address: 'Central Park, NY 10024',
            icon: 'tree',
            is_active: true,
            is_currently_open: false,
            is_free: true,
            is_open: true,
            open_time: '14:00:00',
            close_time: '18:00:00',
            start_date: '2024-08-26',
            end_date: '2024-08-26',
            price: '0.00',
            latitude: '40.7829',
            longitude: '-73.9654',
            lat_lng: { latitude: 40.7829, longitude: -73.9654 }
          }
        ];
        setEvents(fallbackEvents);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events';
      setError(errorMessage);
      // Error will be displayed in the UI instead of an alert
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Mock map styles - these would be applied to react-native-maps
  const mapStyle = useMemo(() => {
    if (!useDarkStyle) return [];

    return [
      { elementType: "geometry", stylers: [{ color: "#212121" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
      {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{ color: "#2c2c2c" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#000000" }],
      },
    ];
  }, [useDarkStyle]);

  // Handle marker press
  const handleMarkerPress = (event: Event) => {
    setSelectedEvent(event);
    setIsEventCardVisible(true);
  };

  // Handle closing the event card
  const handleCloseEventCard = () => {
    setIsEventCardVisible(false);
    setSelectedEvent(null);
  };

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <ThemedText style={styles.loadingText}>Loading events...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
          <ThemedText style={styles.errorSubtext}>Unable to load events</ThemedText>
          <ThemedText style={styles.retryText} onPress={fetchEvents}>
            Tap to retry
          </ThemedText>
        </View>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            ...DEFAULT_CENTER,
            ...DEFAULT_DELTA,
          }}
          customMapStyle={useDarkStyle ? mapStyle : []}
        >
          {events?.map((event) => {
            console.log('Event:', event);
            return (
            <Marker
              key={event.id}
              coordinate={event.lat_lng}
              title={event.title}
              description={`${event.event_type}\n${event.full_address}`}
              onPress={() => handleMarkerPress(event)}
            />
          )})}
        </MapView>
      )}

      <TouchableOpacity
        style={[
          styles.plusButton,
          {
            bottom: safeAreaInsets.bottom + tabBarHeight + 80, // 80px above the dark mode toggle
            right: 20,
          }
        ]}
        onPress={showCreateEventCard}
      >
        <ThemedText style={styles.plusButtonText}>+</ThemedText>
      </TouchableOpacity>

      <DarkModeToggle
        onToggle={() => setUseDarkStyle((v) => !v)}
        useDarkStyle={useDarkStyle}
        style={[
          styles.darkModeToggle,
          {
            bottom: safeAreaInsets.bottom + tabBarHeight + 20, // 20px above tab bar
            right: 20,
          }
        ]}
      />

      <SearchMenu
        style={[
          styles.searchMenu,
          {
            bottom: safeAreaInsets.bottom + tabBarHeight + 20, // 20px above tab bar
            left: 20,
          }
        ]}
      />

      {isEventCardVisible && selectedEvent && (
        <EventCard
          event={selectedEvent}
          isVisible={isEventCardVisible}
          onClose={handleCloseEventCard}
        />
      )}

      {/* Create Event Sliding Card */}
      {isCreateEventCardVisible && (
        <Animated.View
          style={[
            styles.createEventCard,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screenHeight, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.createEventCardHeader}>
            <ThemedText style={styles.createEventCardTitle}>Create New Event</ThemedText>
            <TouchableOpacity onPress={hideCreateEventCard} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.createEventCardContent}>
            <ThemedText style={styles.createEventCardSubtitle}>
              Create a new event at your current location
            </ThemedText>
            
            {/* Placeholder for event creation form */}
            <View style={styles.formPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                Event creation form will go here...
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Example background color
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Example background color
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff0000', // Red color for error
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 5,
  },
  retryText: {
    fontSize: 16,
    color: '#007bff', // Blue color for retry
    textDecorationLine: 'underline',
    marginTop: 15,
  },
  plusButton: {
    position: 'absolute',
    zIndex: 10,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  plusButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  darkModeToggle: {
    position: 'absolute',
    zIndex: 10,
  },
  searchMenu: {
    position: 'absolute',
    zIndex: 10,
  },
  createEventCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 20,
    minHeight: 300,
  },
  createEventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createEventCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  createEventCardContent: {
    flex: 1,
  },
  createEventCardSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  formPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 40,
    minHeight: 200,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});
