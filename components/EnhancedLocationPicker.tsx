import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { romanianCounties, romanianCities, searchLocations, getLocationsForCounty } from '@/constants/romanian-locations';

interface Location {
  county: string;
  city: string;
}

interface EnhancedLocationPickerProps {
  selectedLocation?: Location;
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
}

export default function EnhancedLocationPicker({
  selectedLocation,
  onLocationSelect,
  placeholder = 'Selectează locația'
}: EnhancedLocationPickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Get filtered locations based on search and county selection
  const filteredLocations = useMemo(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const results = searchLocations(searchQuery, selectedCounty || undefined);
      setIsSearching(false);
      return results;
    } else if (selectedCounty) {
      const cities = getLocationsForCounty(selectedCounty);
      return cities.map(city => ({ county: selectedCounty, city }));
    } else {
      return [];
    }
  }, [searchQuery, selectedCounty]);

  // Get all counties for the county selector
  const counties = romanianCounties;

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
    setIsVisible(false);
    setSearchQuery('');
    setSelectedCounty(null);
  };

  const handleCountySelect = (county: string) => {
    setSelectedCounty(county);
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCounty(null);
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationContent}>
        <Text style={styles.cityName}>{item.city}</Text>
        <Text style={styles.countyName}>{item.county}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderCountyItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.countyItem,
        selectedCounty === item && styles.selectedCountyItem
      ]}
      onPress={() => handleCountySelect(item)}
    >
      <Text style={[
        styles.countyText,
        selectedCounty === item && styles.selectedCountyText
      ]}>
        {item}
      </Text>
      {selectedCounty === item && (
        <Ionicons name="checkmark" size={20} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (searchQuery.trim()) {
      return (
        <View style={styles.contentContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Căutare...</Text>
            </View>
          ) : (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  Rezultate pentru "{searchQuery}"
                </Text>
                <Text style={styles.resultsCount}>
                  {filteredLocations.length} locații găsite
                </Text>
              </View>
              <FlatList
                data={filteredLocations}
                renderItem={renderLocationItem}
                keyExtractor={(item, index) => `${item.county}-${item.city}-${index}`}
                style={styles.locationsList}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>
      );
    }

    if (selectedCounty) {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.countyHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedCounty(null)}
            >
              <Ionicons name="arrow-back" size={20} color="#007AFF" />
              <Text style={styles.backButtonText}>Înapoi</Text>
            </TouchableOpacity>
            <Text style={styles.countyTitle}>{selectedCounty}</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Șterge</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredLocations}
            renderItem={renderLocationItem}
            keyExtractor={(item, index) => `${item.county}-${item.city}-${index}`}
            style={styles.locationsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Căutare rapidă</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Caută oraș, sat sau județ..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.countiesSection}>
          <Text style={styles.sectionTitle}>Selectează județul</Text>
          <FlatList
            data={counties}
            renderItem={renderCountyItem}
            keyExtractor={(item) => item}
            style={styles.countiesList}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setIsVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Ionicons name="location-outline" size={20} color="#007AFF" />
          <Text style={styles.selectorText}>
            {selectedLocation 
              ? `${selectedLocation.city}, ${selectedLocation.county}`
              : placeholder
            }
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Anulează</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Selectează locația</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Șterge</Text>
            </TouchableOpacity>
          </View>

          {renderContent()}
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButton: {
    padding: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  searchSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearSearchButton: {
    padding: 5,
  },
  countiesSection: {
    flex: 1,
  },
  countiesList: {
    flex: 1,
  },
  countyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    margin: 5,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedCountyItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  countyText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedCountyText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  countyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#007AFF',
  },
  countyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  locationsList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  locationContent: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  countyName: {
    fontSize: 14,
    color: '#666',
  },
  resultsHeader: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});