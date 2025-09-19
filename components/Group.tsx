import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GroupProps {
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
}

export const Group: React.FC<GroupProps> = ({
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
}) => {
  const groupStyle = {
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

  return <View style={[groupStyle, style]}>{children}</View>;
};

export default Group;
