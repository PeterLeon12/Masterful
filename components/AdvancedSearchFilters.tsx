import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Filter, X, MapPin, DollarSign, Star, Clock } from 'lucide-react-native';
import { serviceCategories } from '@/constants/service-categories';

interface AdvancedFilters {
  category: string;
  rating: number;
  priceRange: [number, number];
  availability: string;
  languages: string[];
}

interface AdvancedSearchFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClose: () => void;
  searchType: 'jobs' | 'professionals';
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  searchType,
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters: AdvancedFilters = {
      category: '',
      rating: 0,
      priceRange: [0, 1000],
      availability: 'all',
      languages: [],
    };
    setLocalFilters(clearedFilters);
  };

  const renderCategoryFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Categorie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {serviceCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              localFilters.category === category.id && styles.categoryChipSelected
            ]}
            onPress={() => updateFilter('category', category.id)}
          >
            <Text style={styles.categoryEmoji}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              localFilters.category === category.id && styles.categoryTextSelected
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderLocationFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Locație</Text>
      <View style={styles.inputContainer}>
        <MapPin size={20} color="#6b7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Oraș, județ sau cod poștal"
          value=""
          onChangeText={(text) => {}}
        />
      </View>
    </View>
  );

  const renderPriceFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Preț</Text>
      <View style={styles.priceContainer}>
        <View style={styles.priceInput}>
          <DollarSign size={16} color="#6b7280" />
          <TextInput
            style={styles.priceInputField}
            placeholder="Min"
            value={localFilters.priceRange[0].toString()}
            onChangeText={(text) => updateFilter('priceRange', [parseInt(text) || 0, localFilters.priceRange[1]])}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.priceSeparator}>-</Text>
        <View style={styles.priceInput}>
          <DollarSign size={16} color="#6b7280" />
          <TextInput
            style={styles.priceInputField}
            placeholder="Max"
            value={localFilters.priceRange[1].toString()}
            onChangeText={(text) => updateFilter('priceRange', [localFilters.priceRange[0], parseInt(text) || 1000])}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderRatingFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Rating minim</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              localFilters.rating >= rating && styles.ratingButtonSelected
            ]}
            onPress={() => updateFilter('rating', rating)}
          >
            <Star 
              size={20} 
              color={localFilters.rating >= rating ? '#fbbf24' : '#d1d5db'} 
              fill={localFilters.rating >= rating ? '#fbbf24' : 'none'}
            />
          </TouchableOpacity>
        ))}
        {localFilters.rating > 0 && (
          <TouchableOpacity
            style={styles.clearRatingButton}
            onPress={() => updateFilter('rating', 0)}
          >
            <X size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderAvailabilityFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>Disponibilitate</Text>
      <View style={styles.availabilityContainer}>
        {[
          { id: 'all', label: 'Toate', icon: '👥' },
          { id: 'available', label: 'Disponibili', icon: '✅' },
          { id: 'busy', label: 'Ocupați', icon: '⏰' },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.availabilityButton,
              localFilters.availability === option.id && styles.availabilityButtonSelected
            ]}
            onPress={() => updateFilter('availability', option.id)}
          >
            <Text style={styles.availabilityIcon}>{option.icon}</Text>
            <Text style={[
              styles.availabilityText,
              localFilters.availability === option.id && styles.availabilityTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSortFilter = () => null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Filter size={20} color="#3b82f6" />
          <Text style={styles.headerTitle}>Filtre avansate</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCategoryFilter()}
        {renderLocationFilter()}
        {renderPriceFilter()}
        {renderRatingFilter()}
        {renderAvailabilityFilter()}
        {renderSortFilter()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Șterge toate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Aplică filtrele</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#3b82f6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  priceInputField: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingButton: {
    padding: 8,
  },
  ratingButtonSelected: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  clearRatingButton: {
    marginLeft: 8,
    padding: 8,
  },
  availabilityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  availabilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  availabilityButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  availabilityIcon: {
    fontSize: 16,
  },
  availabilityText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  availabilityTextSelected: {
    color: '#3b82f6',
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  sortButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  sortIcon: {
    fontSize: 14,
  },
  sortText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  sortTextSelected: {
    color: '#3b82f6',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default AdvancedSearchFilters;
