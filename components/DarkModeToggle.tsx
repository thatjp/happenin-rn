import React, { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface DarkModeToggleProps {
  useDarkStyle: boolean;
  onToggle: (value: boolean) => void;
  style?: any; // Allow custom styling from parent
}

export function DarkModeToggle({ useDarkStyle, onToggle, style }: DarkModeToggleProps) {
  const colorScheme = useColorScheme();

  const themed = useMemo(() => {
    const scheme = colorScheme ?? "light";
    return {
      tint: Colors[scheme].tint,
      cardBg: scheme === "dark" ? "#1E1F20" : "#FFFFFF",
      cardBorder: scheme === "dark" ? "#2A2C2E" : "#E2E4E8",
    };
  }, [colorScheme]);

  return (
    <ThemedView style={[styles.controls, { backgroundColor: themed.cardBg, borderColor: themed.cardBorder }, style]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onToggle(!useDarkStyle)}
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1, backgroundColor: themed.tint }]}>
        <ThemedText style={styles.buttonText}>
          {useDarkStyle ? '☀️' : '🌙'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  controls: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
