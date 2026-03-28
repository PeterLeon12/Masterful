import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface CaptionProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  margin?: number;
  padding?: number;
  numberOfLines?: number;
}

export const Caption: React.FC<CaptionProps> = ({
  children,
  style,
  color = '#6b7280',
  align = 'left',
  weight = 'normal',
  margin = 0,
  padding = 0,
  numberOfLines,
}) => {
  const captionStyle = {
    fontSize: 12,
    lineHeight: 16,
    color,
    textAlign: align,
    fontWeight: weight,
    margin,
    padding,
  };

  return (
    <Text style={[captionStyle, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

export default Caption;
