import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PageProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  safeArea?: boolean;
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  showsVerticalScrollIndicator?: boolean;
  refreshControl?: React.ReactElement;
}

export const Page: React.FC<PageProps> = ({
  children,
  style,
  scrollable = false,
  safeArea = true,
  padding = 0,
  margin = 0,
  backgroundColor = '#ffffff',
  showsVerticalScrollIndicator = true,
  refreshControl,
}) => {
  const pageStyle = {
    flex: 1,
    padding,
    margin,
    backgroundColor,
  };

  const content = scrollable ? (
    <ScrollView
      style={[pageStyle, style]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[pageStyle, style]}>{children}</View>
  );

  if (safeArea) {
    return <SafeAreaView style={{ flex: 1 }}>{content}</SafeAreaView>;
  }

  return content;
};

export default Page;
