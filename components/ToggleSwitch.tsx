import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  size = 'medium',
  color = '#3b82f6',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 40,
          height: 24,
          thumbSize: 20,
        };
      case 'large':
        return {
          width: 60,
          height: 36,
          thumbSize: 30,
        };
      default:
        return {
          width: 50,
          height: 30,
          thumbSize: 26,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const thumbPosition = value ? sizeStyles.width - sizeStyles.thumbSize - 2 : 2;

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, disabled && styles.disabledLabel]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.track,
          {
            width: sizeStyles.width,
            height: sizeStyles.height,
            backgroundColor: value ? color : '#e5e7eb',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: sizeStyles.thumbSize,
              height: sizeStyles.thumbSize,
              left: thumbPosition,
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginRight: 12,
  },
  disabledLabel: {
    color: '#9ca3af',
  },
  track: {
    borderRadius: 15,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ToggleSwitch;
