import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface HeadingProps {
  children: React.ReactNode;
  style?: TextStyle;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  margin?: number;
  padding?: number;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  style,
  level = 1,
  color = '#111827',
  align = 'left',
  weight = 'bold',
  margin = 0,
  padding = 0,
}) => {
  const getFontSize = () => {
    switch (level) {
      case 1: return 32;
      case 2: return 28;
      case 3: return 24;
      case 4: return 20;
      case 5: return 18;
      case 6: return 16;
      default: return 32;
    }
  };

  const getLineHeight = () => {
    switch (level) {
      case 1: return 40;
      case 2: return 36;
      case 3: return 32;
      case 4: return 28;
      case 5: return 24;
      case 6: return 22;
      default: return 40;
    }
  };

  const headingStyle = {
    fontSize: getFontSize(),
    lineHeight: getLineHeight(),
    color,
    textAlign: align,
    fontWeight: weight,
    margin,
    padding,
  };

  return <Text style={[headingStyle, style]}>{children}</Text>;
};

export default Heading;
