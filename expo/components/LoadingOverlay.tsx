import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  color?: string;
  backgroundColor?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  color = '#3b82f6',
  backgroundColor = 'rgba(255, 255, 255, 0.9)',
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor }]}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={color} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    fontSize: 16,
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default LoadingOverlay;
