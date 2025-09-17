import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { MapPin, Plus, X } from 'lucide-react-native';

interface ServiceAreaPickerProps {
  serviceAreas: string[];
  onUpdate: (areas: string[]) => void;
}

const commonAreas = [
  'București Sector 1',
  'București Sector 2',
  'București Sector 3',
  'București Sector 4',
  'București Sector 5',
  'București Sector 6',
  'Ilfov',
  'Cluj-Napoca',
  'Timișoara',
  'Iași',
  'Constanța',
  'Craiova',
  'Galați',
  'Ploiești',
  'Brașov',
  'Brăila',
  'Oradea',
  'Bacău',
  'Pitești',
  'Arad',
];

export const ServiceAreaPicker: React.FC<ServiceAreaPickerProps> = ({
  serviceAreas,
  onUpdate,
}) => {
  const [newArea, setNewArea] = useState('');

  const addArea = () => {
    if (newArea.trim() && !serviceAreas.includes(newArea.trim())) {
      onUpdate([...serviceAreas, newArea.trim()]);
      setNewArea('');
    }
  };

  const removeArea = (areaToRemove: string) => {
    onUpdate(serviceAreas.filter(area => area !== areaToRemove));
  };

  const addCommonArea = (area: string) => {
    if (!serviceAreas.includes(area)) {
      onUpdate([...serviceAreas, area]);
    }
  };

  const renderAreaItem = ({ item }: { item: string }) => (
    <View style={styles.areaItem}>
      <MapPin size={16} color="#6b7280" />
      <Text style={styles.areaText}>{item}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeArea(item)}
      >
        <X size={16} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  const renderCommonArea = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.commonAreaItem,
        serviceAreas.includes(item) && styles.commonAreaItemSelected
      ]}
      onPress={() => addCommonArea(item)}
      disabled={serviceAreas.includes(item)}
    >
      <Text style={[
        styles.commonAreaText,
        serviceAreas.includes(item) && styles.commonAreaTextSelected
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zone de serviciu</Text>
      <Text style={styles.description}>
        Selectează zonele în care oferi servicii
      </Text>

      {/* Current areas */}
      {serviceAreas.length > 0 && (
        <View style={styles.currentAreasContainer}>
          <Text style={styles.sectionTitle}>Zone selectate:</Text>
          <FlatList
            data={serviceAreas}
            renderItem={renderAreaItem}
            keyExtractor={(item) => item}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Add new area */}
      <View style={styles.addAreaContainer}>
        <Text style={styles.sectionTitle}>Adaugă zonă nouă:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ex: București Sector 1"
            value={newArea}
            onChangeText={setNewArea}
            onSubmitEditing={addArea}
          />
          <TouchableOpacity
            style={[styles.addButton, !newArea.trim() && styles.addButtonDisabled]}
            onPress={addArea}
            disabled={!newArea.trim()}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Common areas */}
      <View style={styles.commonAreasContainer}>
        <Text style={styles.sectionTitle}>Zone populare:</Text>
        <FlatList
          data={commonAreas}
          renderItem={renderCommonArea}
          keyExtractor={(item) => item}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.commonAreasRow}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  currentAreasContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  areaText: {
    flex: 1,
    fontSize: 14,
    color: '#0c4a6e',
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  addAreaContainer: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  commonAreasContainer: {
    gap: 12,
  },
  commonAreasRow: {
    justifyContent: 'space-between',
  },
  commonAreaItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  commonAreaItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  commonAreaText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  commonAreaTextSelected: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});

export default ServiceAreaPicker;
