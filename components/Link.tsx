import React from 'react';
import { Text, TouchableOpacity, StyleSheet, TextStyle } from 'react-native';

interface LinkProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: TextStyle;
  color?: string;
  underline?: boolean;
  disabled?: boolean;
  margin?: number;
  padding?: number;
}

export const Link: React.FC<LinkProps> = ({
  children,
  onPress,
  style,
  color = '#3b82f6',
  underline = true,
  disabled = false,
  margin = 0,
  padding = 0,
}) => {
  const linkStyle = {
    color: disabled ? '#9ca3af' : color,
    textDecorationLine: underline ? 'underline' : 'none',
    margin,
    padding,
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text style={[linkStyle, style]}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Link;
