import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 40,
  backgroundColor = '#3b82f6',
  textColor = '#ffffff',
  borderColor,
  borderWidth = 0,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    borderColor,
    borderWidth,
  };

  const textStyle = {
    fontSize: size * 0.4,
    color: textColor,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, avatarStyle]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.container, avatarStyle]}>
      <Text style={[styles.text, textStyle]}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    // Image styles are handled by the Image component
  },
  text: {
    fontWeight: '600',
  },
});

export default Avatar;
