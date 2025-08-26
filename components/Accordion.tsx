import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function Accordion({ title, children, defaultExpanded = false }: AccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [rotateAnim] = useState(new Animated.Value(defaultExpanded ? 1 : 0));

  const toggleAccordion = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(rotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotateIcon = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity 
        style={styles.accordionHeader} 
        onPress={toggleAccordion}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.accordionTitle}>{title}</ThemedText>
        <Animated.View style={[styles.chevron, { transform: [{ rotate: rotateIcon }] }]}>
          <ThemedText style={styles.chevronText}>▼</ThemedText>
        </Animated.View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.accordionContent}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  accordionContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F8F8',
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  chevron: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronText: {
    fontSize: 12,
    color: '#666666',
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
});
