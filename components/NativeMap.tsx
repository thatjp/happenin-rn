import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreateEventCard, EventFormData } from "@/components/CreateEventCard";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { EventCard } from "@/components/EventCard";
import { SearchMenu } from "@/components/SearchMenu";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Event, eventsService } from "@/lib/api";

import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

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
  const [zoomLevel, setZoomLevel] = useState(10);
  const [calloutOpacity] = useState(new Animated.Value(0));
  
  // Function to show the create event card
  const showCreateEventCard = () => {
    setIsCreateEventCardVisible(true);
  };

  // Function to hide the create event card
  const hideCreateEventCard = () => {
    setIsCreateEventCardVisible(false);
  };

  // Function to handle event creation
  const handleCreateEvent = (eventData: EventFormData) => {
    // TODO: Implement event creation logic
    console.log('Creating event:', eventData);
    
    // For now, just close the card
    hideCreateEventCard();
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

  // Calculate zoom level from region
  const calculateZoomLevel = (region: Region) => {
    return Math.log2(360 / region.longitudeDelta);
  };

  // Calculate callout opacity based on zoom level
  const getCalloutOpacity = (zoom: number, minZoom: number = 15, maxZoom: number = 18) => {
    // Only show callouts when zoomed in enough (zoom >= 15)
    // Adjust minZoom to control when callouts first appear
    if (zoom < minZoom) return 0;
    if (zoom > maxZoom) return 1;
    
    // Smooth transition between min and max zoom
    return (zoom - minZoom) / (maxZoom - minZoom);
  };

  // Handle map region changes to track zoom
  const handleRegionChangeComplete = (region: Region) => {
    const newZoom = calculateZoomLevel(region);
    console.log('Region changed, new zoom:', newZoom);
    setZoomLevel(newZoom);
    
    // Animate callout opacity
    const opacity = getCalloutOpacity(newZoom);
    console.log('Calculated opacity:', opacity);
    Animated.timing(calloutOpacity, {
      toValue: opacity,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Also track region changes while moving (more responsive)
  const handleRegionChange = (region: Region) => {
    const newZoom = calculateZoomLevel(region);
    setZoomLevel(newZoom);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            onRegionChange={handleRegionChange}
            onRegionChangeComplete={handleRegionChangeComplete}
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
              >
                <Callout
                  tooltip={true}
                  style={{
                    // opacity: getCalloutOpacity(zoomLevel),
                    // // Hide callout completely when opacity is 0
                    // display: getCalloutOpacity(zoomLevel) === 0 ? 'none' : 'flex',
                    backgroundColor: 'white',
                    borderRadius: 8,
                    padding: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  <View style={{ minWidth: 120 }}>
                    <ThemedText style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
                      {event.title}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                      {event.event_type}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 11, color: '#888' }}>
                      {event.full_address}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 10, color: '#999', fontStyle: 'italic' }}>
                      Opacity: {getCalloutOpacity(zoomLevel).toFixed(2)}
                    </ThemedText>
                  </View>
                </Callout>
              </Marker>
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

        {/* Debug: Show current zoom level (remove in production) */}
        <View style={[styles.debugInfo, { top: safeAreaInsets.top + 20 }]}>
          <ThemedText style={styles.debugText}>
            Zoom: {zoomLevel.toFixed(2)} | Opacity: {getCalloutOpacity(zoomLevel).toFixed(2)}
          </ThemedText>
        </View>

        {isEventCardVisible && selectedEvent && (
          <EventCard
            event={selectedEvent}
            isVisible={isEventCardVisible}
            onClose={handleCloseEventCard}
          />
        )}

        {/* Create Event Sliding Card */}
        {isCreateEventCardVisible && (
          <CreateEventCard
            isVisible={isCreateEventCardVisible}
            onClose={hideCreateEventCard}
            onSubmit={handleCreateEvent}
          />
        )}
      </ThemedView>
    </GestureHandlerRootView>
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
  debugInfo: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 6,
    left: 20,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
