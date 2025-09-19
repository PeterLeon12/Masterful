import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface ParagraphProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  size?: 'small' | 'medium' | 'large';
  margin?: number;
  padding?: number;
  numberOfLines?: number;
}

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  style,
  color = '#374151',
  align = 'left',
  weight = 'normal',
  size = 'medium',
  margin = 0,
  padding = 0,
  numberOfLines,
}) => {
  const getFontSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'medium': return 14;
      case 'large': return 16;
      default: return 14;
    }
  };

  const getLineHeight = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 24;
      default: return 20;
    }
  };

  const paragraphStyle = {
    fontSize: getFontSize(),
    lineHeight: getLineHeight(),
    color,
    textAlign: align,
    fontWeight: weight,
    margin,
    padding,
  };

  return (
    <Text style={[paragraphStyle, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

export default Paragraph;
