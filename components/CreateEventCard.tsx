import { Accordion } from "@/components/Accordion";
import { ThemedText } from "@/components/ThemedText";
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface CreateEventCardProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (eventData: EventFormData) => void;
}

export interface EventFormData {
  title: string;
  address: string;
  city: string;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
}

export function CreateEventCard({ isVisible, onClose, onSubmit }: CreateEventCardProps) {
  const screenHeight = Dimensions.get('window').height;
  const tabBarHeight = useBottomTabBarHeight();
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  // Show animation when component becomes visible
  React.useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [isVisible, slideAnim]);

  // Function to handle form submission
  const handleSubmit = () => {
    const eventData: EventFormData = {
      title: eventTitle,
      address: eventAddress,
      city: eventCity,
      startDate,
      endDate,
      startTime,
      endTime,
    };
    
    onSubmit(eventData);
    
    // Reset form
    setEventTitle('');
    setEventAddress('');
    setEventCity('');
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime(new Date());
    setEndTime(new Date());
  };

  // Function to handle closing
  const handleClose = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      onClose();
    });
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.createEventCard,
        {
          bottom: tabBarHeight, // Position above the tab bar
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
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <ThemedText style={styles.closeButtonText}>✕</ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.createEventCardContent}>
        <ThemedText style={styles.createEventCardSubtitle}>
          Create a new event at your current location
        </ThemedText>
        
        {/* Event Creation Form */}
        <View style={styles.formContainer}>
          {/* Title Input */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Event Title *</ThemedText>
            <TextInput
              style={styles.textInput}
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="Enter event title"
              placeholderTextColor="#999"
            />
          </View>

          {/* Address Section Accordion */}
          <Accordion title="Location Details" defaultExpanded={true}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Address *</ThemedText>
              <TextInput
                style={styles.textInput}
                value={eventAddress}
                onChangeText={setEventAddress}
                placeholder="Enter event address"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>City *</ThemedText>
              <TextInput
                style={styles.textInput}
                value={eventCity}
                onChangeText={setEventCity}
                placeholder="Enter city"
                placeholderTextColor="#999"
              />
            </View>
          </Accordion>

          {/* Date and Time Section Accordion */}
          <Accordion title="Date & Time" defaultExpanded={false}>
            {/* Start Date & Time */}
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeContainer}>
                <ThemedText style={styles.inputLabel}>Start Date</ThemedText>
                <TouchableOpacity style={styles.dateTimeButton}>
                  <ThemedText style={styles.dateTimeButtonText}>
                    {startDate.toLocaleDateString()}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateTimeContainer}>
                <ThemedText style={styles.inputLabel}>Start Time</ThemedText>
                <TouchableOpacity style={styles.dateTimeButton}>
                  <ThemedText style={styles.dateTimeButtonText}>
                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* End Date & Time */}
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeContainer}>
                <ThemedText style={styles.inputLabel}>End Date</ThemedText>
                <TouchableOpacity style={styles.dateTimeButton}>
                  <ThemedText style={styles.dateTimeButtonText}>
                    {endDate.toLocaleDateString()}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateTimeContainer}>
                <ThemedText style={styles.inputLabel}>End Time</ThemedText>
                <TouchableOpacity style={styles.dateTimeButton}>
                  <ThemedText style={styles.dateTimeButtonText}>
                    {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Accordion>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!eventTitle || !eventAddress || !eventCity) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!eventTitle || !eventAddress || !eventCity}
          >
            <ThemedText style={styles.submitButtonText}>Create Event</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: '70%', // Reduced to account for tab bar
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
    paddingBottom: 20,
  },
  createEventCardSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },

  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateTimeContainer: {
    flex: 1,
    marginRight: 10,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
