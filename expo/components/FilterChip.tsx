import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  color?: string;
  backgroundColor?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  onRemove,
  color = '#3b82f6',
  backgroundColor = '#eff6ff',
}) => {
  return (
    <View style={[styles.chip, { backgroundColor }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <X size={14} color={color} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  removeButton: {
    padding: 2,
  },
});

export default FilterChip;
