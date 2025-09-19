import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface MapViewProps {
  latitude: number;
  longitude: number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
  }>;
  onMarkerPress?: (marker: any) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  markers = [],
  onMarkerPress,
}) => {
  // This is a placeholder component
  // In a real app, you would use react-native-maps or similar
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <MapPin size={48} color="#6b7280" />
        <Text style={styles.placeholderText}>Map View</Text>
        <Text style={styles.coordinatesText}>
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        {markers.length > 0 && (
          <Text style={styles.markersText}>
            {markers.length} marker{markers.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    margin: 16,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 8,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  markersText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});

export default MapView;
