import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SortAsc, SortDesc } from 'lucide-react-native';

interface SortButtonProps {
  label: string;
  sortOrder: 'asc' | 'desc' | null;
  onPress: () => void;
  active?: boolean;
}

export const SortButton: React.FC<SortButtonProps> = ({
  label,
  sortOrder,
  onPress,
  active = false,
}) => {
  const getIcon = () => {
    if (sortOrder === 'asc') return <SortAsc size={16} color="#3b82f6" />;
    if (sortOrder === 'desc') return <SortDesc size={16} color="#3b82f6" />;
    return <SortAsc size={16} color="#6b7280" />;
  };

  return (
    <TouchableOpacity 
      style={[styles.button, active && styles.activeButton]} 
      onPress={onPress}
    >
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
      {getIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  activeButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginRight: 4,
  },
  activeLabel: {
    color: '#3b82f6',
  },
});

export default SortButton;
