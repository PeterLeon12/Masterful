import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { MapPin, ChevronDown, X } from 'lucide-react-native';
import { romanianCounties, romanianCities } from '@/constants/romanian-locations';

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [step, setStep] = useState<'county' | 'city'>('county');

  const handleCountySelect = (county: string) => {
    setSelectedCounty(county);
    setStep('city');
  };

  const handleCitySelect = (city: string) => {
    if (selectedCounty) {
      onLocationSelect({ county: selectedCounty, city });
      setIsModalVisible(false);
      setStep('county');
      setSelectedCounty(null);
    }
  };

  const handleBack = () => {
    if (step === 'city') {
      setStep('county');
      setSelectedCounty(null);
    } else {
      setIsModalVisible(false);
    }
  };

  const displayText = selectedLocation 
    ? `${selectedLocation.city}, ${selectedLocation.county}`
    : placeholder;

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsModalVisible(true)}
      >
        <MapPin size={20} color="#64748b" />
        <Text style={[styles.triggerText, !selectedLocation && styles.placeholder]}>
          {displayText}
        </Text>
        <ChevronDown size={20} color="#64748b" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {step === 'county' ? 'Selectează județul' : `Selectează orașul din ${selectedCounty}`}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <FlatList
            data={step === 'county' ? romanianCounties : romanianCities[selectedCounty!] || []}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => step === 'county' ? handleCountySelect(item) : handleCitySelect(item)}
              >
                <Text style={styles.listItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  placeholder: {
    color: '#9ca3af',
  },
  modal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  listItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemText: {
    fontSize: 16,
    color: '#374151',
  },
});