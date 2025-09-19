import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface RecentActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  onPress?: () => void;
  color?: string;
}

export const RecentActivityItem: React.FC<RecentActivityItemProps> = ({
  icon: Icon,
  title,
  description,
  time,
  onPress,
  color = '#3b82f6',
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon size={16} color="#ffffff" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      
      <Text style={styles.time}>{time}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default RecentActivityItem;
