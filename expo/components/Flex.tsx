import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface FlexProps {
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
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
}

export const Flex: React.FC<FlexProps> = ({
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
  flex,
  flexGrow,
  flexShrink,
  flexBasis,
}) => {
  const flexStyle: ViewStyle = {
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
    flex,
    flexGrow,
    flexShrink,
    flexBasis: flexBasis as any,
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

  return <View style={[flexStyle, style]}>{children}</View>;
};

export default Flex;
