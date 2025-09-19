import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface BoxProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
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
  position?: 'relative' | 'absolute';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  zIndex?: number;
}

export const Box: React.FC<BoxProps> = ({
  children,
  style,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
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
  position = 'relative',
  top,
  right,
  bottom,
  left,
  zIndex,
}) => {
  const boxStyle = {
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
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
    position,
    top,
    right,
    bottom,
    left,
    zIndex,
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

  return <View style={[boxStyle, style]}>{children}</View>;
};

export default Box;
