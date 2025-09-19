import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface StackProps {
  children: React.ReactNode;
  style?: ViewStyle;
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: number;
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: boolean;
  wrap?: 'wrap' | 'nowrap';
}

export const Stack: React.FC<StackProps> = ({
  children,
  style,
  direction = 'column',
  align = 'flex-start',
  justify = 'flex-start',
  gap = 0,
  padding = 0,
  margin = 0,
  backgroundColor = 'transparent',
  borderRadius = 0,
  borderWidth = 0,
  borderColor = 'transparent',
  shadow = false,
  wrap = 'nowrap',
}) => {
  const stackStyle = {
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    gap,
    padding,
    margin,
    backgroundColor,
    borderRadius,
    borderWidth,
    borderColor,
    flexWrap: wrap,
    ...(shadow && {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    }),
  };

  return <View style={[stackStyle, style]}>{children}</View>;
};

export default Stack;
