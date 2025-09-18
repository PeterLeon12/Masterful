import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, TextInput, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { serviceCategories } from '@/constants/service-categories';
import EnhancedLocationPicker from '@/components/EnhancedLocationPicker';
import AdvancedSearchFilters from '@/components/AdvancedSearchFilters';
import MapSearchView from '@/components/MapSearchView';
import { Search, Filter, Star, MapPin, Clock, Map, MessageSquare } from 'lucide-react-native';
import { useProfessionals } from '@/hooks/useApi';
import { useApiError } from '@/hooks/useApiError';
import { ListLoader } from '@/components/LoadingStates';
import { router } from 'expo-router';

interface Location {
  county: string;
  city: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface AdvancedFilters {
  category: string;
  rating: number;
  priceRange: [number, number];
  availability: string;
  languages: string[];
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    category: '',
    rating: 0,
    priceRange: [0, 1000],
    availability: '',
    languages: []
  });
  const { error, clearError } = useApiError();

  // Memoize filters to prevent infinite re-renders
  const professionalsFilters = useMemo(() => {
    const filters: {
      categories?: string[];
      minRating?: number;
      maxHourlyRate?: number;
      isAvailable?: boolean;
      location?: string;
      county?: string;
      city?: string;
      limit?: number;
      offset?: number;
    } = {
      limit: 50,
      isAvailable: true,
    };
    
    // Map category to categories array
    const category = selectedCategory || advancedFilters.category;
    if (category) {
      filters.categories = [category];
    }
    
    // Map rating
    if (advancedFilters.rating > 0) {
      filters.minRating = advancedFilters.rating;
    }
    
    // Map price range
    if (advancedFilters.priceRange[1] < 1000) {
      filters.maxHourlyRate = advancedFilters.priceRange[1];
    }
    
    // Map location filters
    if (selectedLocation) {
      filters.county = selectedLocation.county;
      filters.city = selectedLocation.city;
      // Also add a combined location string for broader search
      filters.location = `${selectedLocation.city}, ${selectedLocation.county}`;
    }
    
    return filters;
  }, [selectedCategory, advancedFilters.category, advancedFilters.rating, advancedFilters.priceRange[1], selectedLocation]);

  // Fetch real professionals data from API
  const { 
    data: professionalsData, 
    isLoading: professionalsLoading, 
    refresh: refreshProfessionals 
  } = useProfessionals(professionalsFilters);

  const professionals = professionalsData?.professionals || [];

  const handleAdvancedFiltersApply = (filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    setShowAdvancedFilters(false);
  };

  const handleMapLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setShowMapView(false);
  };

  const renderCategoryFilter = ({ item }: { item: typeof serviceCategories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryFilter,
        selectedCategory === item.id && styles.categoryFilterSelected
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
    >
      <Text style={styles.categoryFilterIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryFilterText,
        selectedCategory === item.id && styles.categoryFilterTextSelected
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  interface ProfessionalData {
    id: string;
    categories?: string[] | string;
    serviceAreas?: string[] | string;
    hourlyRate: number;
    rating?: number;
    reviewCount?: number;
    completedJobs?: number;
    user?: {
      name?: string;
      avatar?: string;
    };
  }

  const renderProfessionalCard = ({ item }: { item: ProfessionalData }) => {
    const specialties = Array.isArray(item.categories) ? item.categories : (item.categories ? item.categories.split(',').map((cat: string) => cat.trim()) : []);
    const location = Array.isArray(item.serviceAreas) ? item.serviceAreas[0] : (item.serviceAreas ? JSON.parse(item.serviceAreas)[0] : 'Locație nespecificată');
    
    return (
      <TouchableOpacity style={styles.professionalCard}>
        <View style={styles.professionalHeader}>
          <View style={styles.professionalAvatar}>
            <Text style={styles.professionalAvatarText}>{item.user?.avatar || '👨‍🔧'}</Text>
          </View>
          <View style={styles.professionalInfo}>
            <Text style={styles.professionalName}>{item.user?.name || 'Meșter'}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.rating}>{item.rating || 0}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount || 0} recenzii)</Text>
            </View>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#6b7280" />
              <Text style={styles.location}>{location}</Text>
            </View>
          </View>
          <View style={styles.professionalStats}>
            <Text style={styles.price}>{item.hourlyRate} RON/oră</Text>
            <View style={styles.responseTime}>
              <Clock size={12} color="#6b7280" />
              <Text style={styles.responseTimeText}>~1 oră</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.specialtiesContainer}>
          {specialties.slice(0, 3).map((specialty: string, index: number) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.completedJobs}>
          {item.completedJobs || 0} proiecte finalizate
        </Text>
        
        <TouchableOpacity
          style={styles.reviewsButton}
          onPress={() => router.push(`/reviews/${item.id}`)}
        >
          <MessageSquare size={16} color="#3b82f6" />
          <Text style={styles.reviewsButtonText}>Vezi recenziile</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Găsește meșteri</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMapView(true)}
          >
            <Map size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowAdvancedFilters(true)}
          >
            <Filter size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută servicii sau meșteri..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Locație</Text>
            <EnhancedLocationPicker
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
              placeholder="Selectează locația"
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Categorie</Text>
            <FlatList
              data={serviceCategories}
              renderItem={renderCategoryFilter}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryFilters}
            />
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={professionalsLoading}
            onRefresh={() => {
              clearError();
              refreshProfessionals();
            }}
          />
        }
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {professionals.length} meșteri găsiți
          </Text>
        </View>

        {professionalsLoading ? (
          <ListLoader />
        ) : professionals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nu s-au găsit meșteri pentru criteriile selectate
            </Text>
          </View>
        ) : (
          <FlatList
            data={professionals}
            renderItem={renderProfessionalCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Advanced Filters Modal */}
      <Modal
        visible={showAdvancedFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AdvancedSearchFilters
          filters={advancedFilters}
          onFiltersChange={handleAdvancedFiltersApply}
          onClose={() => setShowAdvancedFilters(false)}
          searchType="professionals"
        />
      </Modal>

      {/* Map View Modal */}
      <Modal
        visible={showMapView}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <MapSearchView
          onLocationSelect={handleMapLocationSelect}
          onClose={() => setShowMapView(false)}
          initialLocation={selectedLocation && selectedLocation.latitude && selectedLocation.longitude ? {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            address: selectedLocation.address || '',
            city: selectedLocation.city,
            county: selectedLocation.county
          } : undefined}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filtersContainer: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryFilters: {
    gap: 8,
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  categoryFilterSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryFilterIcon: {
    fontSize: 16,
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryFilterTextSelected: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    color: '#6b7280',
  },
  professionalCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  professionalHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  professionalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  professionalAvatarText: {
    fontSize: 20,
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
  },
  professionalStats: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  responseTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  responseTimeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  specialtyTag: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  completedJobs: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  reviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  reviewsButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});