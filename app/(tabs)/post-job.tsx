import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { serviceCategories } from '@/constants/service-categories';
import EnhancedLocationPicker from '@/components/EnhancedLocationPicker';
import { supabaseApiClient } from '@/services/supabaseApi';
import { useApiError } from '@/hooks/useApiError';

interface Location {
  county: string;
  city: string;
}

export default function PostJobScreen() {
  const { user } = useAuth();
  const { error, clearError } = useApiError();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);

  const isClient = user?.role === 'CLIENT';

  interface UrgencyOption {
    id: 'low' | 'medium' | 'high';
    label: string;
    color: string;
  }

  const urgencyOptions: UrgencyOption[] = [
    { id: 'low', label: 'În următoarele săptămâni', color: '#10b981' },
    { id: 'medium', label: 'În următoarele zile', color: '#f59e0b' },
    { id: 'high', label: 'Urgent (astăzi/mâine)', color: '#ef4444' },
  ];

  const selectedCategoryData = serviceCategories.find(cat => cat.id === selectedCategory);

  const handleSubmit = async () => {
    if (!title || !description || !selectedCategory || !selectedLocation) {
      Alert.alert('Eroare', 'Te rog completează toate câmpurile obligatorii');
      return;
    }

    if (!isClient) {
      Alert.alert('Eroare', 'Doar clienții pot posta sarcini');
      return;
    }

    setIsLoading(true);
    clearError();
    
    try {
      const jobData = {
        title,
        description,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        location: JSON.stringify({
          county: selectedLocation.county,
          city: selectedLocation.city
        }),
        priority: urgency.toUpperCase() as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
      };

      const response = await supabaseApiClient.createJob({
        ...jobData,
        subcategory: jobData.subcategory || undefined
      });
      
      if (response.success) {
        Alert.alert(
          'Succes!',
          'Sarcina a fost postată cu succes!',
          [{ text: 'OK', onPress: () => {
            // Reset form
            setTitle('');
            setDescription('');
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            setSelectedLocation(undefined);
            setUrgency('medium');
          }}]
        );
      } else {
        throw new Error(response.error || 'Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      Alert.alert('Eroare', 'Nu s-a putut posta sarcina. Te rog încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isClient ? 'Postează o sarcină' : 'Adaugă proiect'}
        </Text>
        <Text style={styles.subtitle}>
          {isClient ? 'Descrie ce ai nevoie și găsește meșterul potrivit' : 'Adaugă un nou proiect în portofoliul tău'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informații de bază</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titlu *</Text>
            <TextInput
              style={styles.input}
              placeholder={isClient ? "ex. Asamblare dulap IKEA" : "ex. Renovare bucătărie modernă"}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descriere *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={isClient ? "Descrie în detaliu ce ai nevoie..." : "Descrie proiectul și rezultatele obținute..."}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorie</Text>
          
          <View style={styles.categoryGrid}>
            {serviceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardSelected,
                  { borderLeftColor: category.color }
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  setSelectedSubcategory(null);
                }}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.categoryNameSelected
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedCategoryData && (
            <View style={styles.subcategoryContainer}>
              <Text style={styles.label}>Subcategorie</Text>
              <View style={styles.subcategoryGrid}>
                {selectedCategoryData.subcategories.map((subcategory) => (
                  <TouchableOpacity
                    key={subcategory}
                    style={[
                      styles.subcategoryTag,
                      selectedSubcategory === subcategory && styles.subcategoryTagSelected
                    ]}
                    onPress={() => setSelectedSubcategory(subcategory)}
                  >
                    <Text style={[
                      styles.subcategoryText,
                      selectedSubcategory === subcategory && styles.subcategoryTextSelected
                    ]}>
                      {subcategory}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locație</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Locație *</Text>
            <EnhancedLocationPicker
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
              placeholder="Selectează locația"
            />
          </View>
        </View>

        {isClient && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Urgență</Text>
            <View style={styles.urgencyContainer}>
              {urgencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.urgencyOption,
                    urgency === option.id && styles.urgencyOptionSelected,
                    { borderColor: option.color }
                  ]}
                  onPress={() => setUrgency(option.id as any)}
                >
                  <View style={[styles.urgencyDot, { backgroundColor: option.color }]} />
                  <Text style={[
                    styles.urgencyText,
                    urgency === option.id && styles.urgencyTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading 
              ? (isClient ? 'Se postează...' : 'Se adaugă...') 
              : (isClient ? 'Postează sarcina' : 'Adaugă proiectul')
            }
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  categoryCardSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: '#1d4ed8',
  },
  subcategoryContainer: {
    marginTop: 16,
  },
  subcategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subcategoryTag: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  subcategoryTagSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  subcategoryText: {
    fontSize: 14,
    color: '#374151',
  },
  subcategoryTextSelected: {
    color: '#ffffff',
  },
  urgencyContainer: {
    gap: 12,
  },
  urgencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  urgencyOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 16,
    color: '#374151',
  },
  urgencyTextSelected: {
    color: '#1d4ed8',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 20,
    marginTop: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});