import React from 'react';
import { StyleSheet } from 'react-native';

import { NativeMap } from '@/components/NativeMap';
import { ThemedView } from '@/components/ThemedView';

export default function MapScreen() {
  return (
    <ThemedView style={styles.container}>
      <NativeMap />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


