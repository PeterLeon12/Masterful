import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SpacerProps {
  size?: number;
  horizontal?: boolean;
  color?: string;
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 16,
  horizontal = false,
  color = 'transparent',
}) => {
  const spacerStyle = horizontal
    ? { width: size, backgroundColor: color }
    : { height: size, backgroundColor: color };

  return <View style={[styles.spacer, spacerStyle]} />;
};

const styles = StyleSheet.create({
  spacer: {
    // Base spacer styles
  },
});

export default Spacer;
