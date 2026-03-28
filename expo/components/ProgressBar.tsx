import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  duration?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showPercentage = false,
  animated = true,
  duration = 300,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, duration, animatedValue]);

  const progressWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.progress,
            {
              height,
              backgroundColor: color,
              width: progressWidth,
            },
          ]}
        />
      </View>
      
      {showPercentage && (
        <Text style={styles.percentageText}>
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
    minWidth: 32,
    textAlign: 'right',
  },
});

export default ProgressBar;
