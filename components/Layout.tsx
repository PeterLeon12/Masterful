import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeArea?: boolean;
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  flex?: number;
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  style,
  safeArea = true,
  padding = 0,
  margin = 0,
  backgroundColor = '#ffffff',
  flex = 1,
  direction = 'column',
  align = 'flex-start',
  justify = 'flex-start',
}) => {
  const layoutStyle = {
    flex,
    padding,
    margin,
    backgroundColor,
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
  };

  if (safeArea) {
    return (
      <SafeAreaView style={[layoutStyle, style]}>
        {children}
      </SafeAreaView>
    );
  }

  return <View style={[layoutStyle, style]}>{children}</View>;
};

export default Layout;
