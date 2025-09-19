import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface WrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: boolean;
  flex?: number;
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  style,
  padding = 0,
  margin = 0,
  backgroundColor = 'transparent',
  borderRadius = 0,
  borderWidth = 0,
  borderColor = 'transparent',
  shadow = false,
  flex,
  direction = 'column',
  align = 'flex-start',
  justify = 'flex-start',
}) => {
  const wrapperStyle = {
    padding,
    margin,
    backgroundColor,
    borderRadius,
    borderWidth,
    borderColor,
    flex,
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
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

  return <View style={[wrapperStyle, style]}>{children}</View>;
};

export default Wrapper;
