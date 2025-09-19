import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: number;
  margin?: number;
  text?: string;
  textColor?: string;
  textStyle?: any;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  color = '#e5e7eb',
  thickness = 1,
  margin = 16,
  text,
  textColor = '#6b7280',
  textStyle,
}) => {
  if (text) {
    return (
      <View style={styles.textContainer}>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
        <Text style={[styles.text, { color: textColor }, textStyle]}>{text}</Text>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
      </View>
    );
  }

  const dividerStyle = orientation === 'horizontal' 
    ? { height: thickness, marginVertical: margin }
    : { width: thickness, marginHorizontal: margin };

  return (
    <View style={[styles.divider, { backgroundColor: color }, dividerStyle]} />
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: '#e5e7eb',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Divider;
