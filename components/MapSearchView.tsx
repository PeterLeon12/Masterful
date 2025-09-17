import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MapPin, Navigation, List, X } from 'lucide-react-native';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  county: string;
}

interface MapSearchViewProps {
  onLocationSelect: (location: Location) => void;
  onClose: () => void;
  initialLocation?: Location;
}

export const MapSearchView: React.FC<MapSearchViewProps> = ({
  onLocationSelect,
  onClose,
  initialLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock location data - in a real app, this would come from a map service
  const mockLocations: Location[] = [
    {
      latitude: 44.4268,
      longitude: 26.1025,
      address: 'Piața Universității, București',
      city: 'București',
      county: 'București',
    },
    {
      latitude: 44.4396,
      longitude: 26.0964,
      address: 'Calea Victoriei, București',
      city: 'București',
      county: 'București',
    },
    {
      latitude: 44.4475,
      longitude: 26.0975,
      address: 'Parcul Herăstrău, București',
      city: 'București',
      county: 'București',
    },
  ];

  const handleLocationPress = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      Alert.alert('Eroare', 'Te rog selectează o locație');
    }
  };

  const handleUseCurrentLocation = () => {
    setIsLoading(true);
    
    // Mock getting current location
    setTimeout(() => {
      const currentLocation: Location = {
        latitude: 44.4268,
        longitude: 26.1025,
        address: 'Locația ta actuală',
        city: 'București',
        county: 'București',
      };
      
      setSelectedLocation(currentLocation);
      setIsLoading(false);
    }, 1500);
  };

  const renderLocationItem = (location: Location, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.locationItem,
        selectedLocation?.address === location.address && styles.locationItemSelected
      ]}
      onPress={() => handleLocationPress(location)}
    >
      <View style={styles.locationIcon}>
        <MapPin size={20} color="#3b82f6" />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationAddress}>{location.address}</Text>
        <Text style={styles.locationDetails}>{location.city}, {location.county}</Text>
      </View>
      {selectedLocation?.address === location.address && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MapPin size={20} color="#3b82f6" />
          <Text style={styles.headerTitle}>Selectează locația</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapPlaceholder}>
        <MapPin size={48} color="#d1d5db" />
        <Text style={styles.mapPlaceholderText}>Hartă interactivă</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          În versiunea completă, aici va fi afișată o hartă interactivă
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.currentLocationButton]}
          onPress={handleUseCurrentLocation}
          disabled={isLoading}
        >
          <Navigation size={16} color="#ffffff" />
          <Text style={styles.actionButtonText}>
            {isLoading ? 'Se încarcă...' : 'Locația actuală'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.locationsContainer}>
        <Text style={styles.locationsTitle}>Locații populare</Text>
        <View style={styles.locationsList}>
          {mockLocations.map((location, index) => renderLocationItem(location, index))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Anulează</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
          onPress={handleConfirmLocation}
          disabled={!selectedLocation}
        >
          <Text style={styles.confirmButtonText}>Confirmă locația</Text>
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
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  currentLocationButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  locationsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  locationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  locationsList: {
    gap: 8,
  },
  locationItem: {
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
  locationItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  locationDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default MapSearchView;
