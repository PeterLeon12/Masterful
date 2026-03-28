import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  onPress?: (category: any) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onPress 
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(category);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: category.color }]} 
      onPress={handlePress}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{category.icon}</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{category.name}</Text>
          <Text style={styles.description}>{category.description}</Text>
        </View>
        <ChevronRight size={20} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default CategoryCard;
