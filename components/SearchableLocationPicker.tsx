import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { romanianCounties, romanianCities } from '@/constants/romanian-locations';

interface Location {
  county: string;
  city: string;
}

interface SearchableLocationPickerProps {
  selectedLocation?: Location | null;
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
}

export default function SearchableLocationPicker({
  selectedLocation,
  onLocationSelect,
  placeholder = 'Selectează locația'
}: SearchableLocationPickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [showCounties, setShowCounties] = useState(true);

  // Filter counties based on search query
  const filteredCounties = useMemo(() => {
    if (!searchQuery.trim()) return romanianCounties;
    return romanianCounties.filter(county =>
      county.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Filter cities based on search query and selected county
  const filteredCities = useMemo(() => {
    if (!selectedCounty) return [];
    const cities = romanianCities[selectedCounty] || [];
    if (!searchQuery.trim()) return cities;
    return cities.filter(city =>
      city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedCounty, searchQuery]);

  const handleCountySelect = (county: string) => {
    setSelectedCounty(county);
    setShowCounties(false);
    setSearchQuery(''); // Clear search to show all cities
  };

  const handleCitySelect = (city: string) => {
    if (selectedCounty) {
      onLocationSelect({ county: selectedCounty, city });
      setIsVisible(false);
      setSearchQuery('');
      setSelectedCounty(null);
      setShowCounties(true);
    }
  };

  const handleBackToCounties = () => {
    setSelectedCounty(null);
    setShowCounties(true);
    setSearchQuery('');
  };

  const handleClose = () => {
    setIsVisible(false);
    setSearchQuery('');
    setSelectedCounty(null);
    setShowCounties(true);
  };

  const renderCountyItem = ({ item: county }: { item: string }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleCountySelect(county)}
    >
      <Text style={styles.listItemText}>{county}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderCityItem = ({ item: city }: { item: string }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleCitySelect(city)}
    >
      <Text style={styles.listItemText}>{city}</Text>
      <Ionicons name="location" size={20} color="#666" />
    </TouchableOpacity>
  );

  const getDisplayText = () => {
    if (selectedLocation) {
      return `${selectedLocation.city}, ${selectedLocation.county}`;
    }
    return placeholder;
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsVisible(true)}
      >
        <Ionicons name="location-outline" size={20} color="#666" />
        <Text style={[styles.selectorText, !selectedLocation && styles.placeholderText]}>
          {getDisplayText()}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {showCounties ? 'Selectează județul' : `Selectează localitatea din ${selectedCounty}`}
            </Text>
            {!showCounties && (
              <TouchableOpacity onPress={handleBackToCounties} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={showCounties ? 'Caută județ...' : 'Caută localitate...'}
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={showCounties ? filteredCounties : filteredCities}
            renderItem={showCounties ? renderCountyItem : renderCityItem}
            keyExtractor={(item) => item}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  {showCounties ? 'Nu s-au găsit județe' : 'Nu s-au găsit localități'}
                </Text>
                <Text style={styles.emptySubtext}>
                  Încearcă să modifici termenii de căutare
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  placeholderText: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
