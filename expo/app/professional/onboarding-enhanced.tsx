import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { serviceCategories } from '@/constants/service-categories';
import EnhancedLocationPicker from '@/components/EnhancedLocationPicker';
import { 
  User, Phone, Briefcase, DollarSign, MapPin, Clock, 
  Award, FileText, Camera, Plus, Check, ChevronRight 
} from 'lucide-react-native';
import { apiClient } from '@/services/api';

interface FormData {
  // Basic Info
  name: string;
  phone: string;
  location: { county: string; city: string };
  
  // Professional Info
  bio: string;
  experience: string;
  hourlyRate: string;
  selectedCategories: string[];
  
  // Certifications & Portfolio
  certifications: string;
  portfolio: string[];
  
  // Working Hours
  workingHours: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  
  // Service Areas
  serviceAreas: string[];
  
  // Insurance & Verification
  hasInsurance: boolean;
  insuranceDetails: string;
}

export default function EnhancedProfessionalOnboardingScreen() {
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    phone: user?.phone || '',
    location: { county: '', city: '' },
    bio: '',
    experience: '',
    hourlyRate: '',
    selectedCategories: [],
    certifications: '',
    portfolio: [],
    workingHours: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '15:00', available: false },
      sunday: { start: '09:00', end: '15:00', available: false },
    },
    serviceAreas: [],
    hasInsurance: false,
    insuranceDetails: '',
  });

  if (!user) {
    router.replace('/login');
    return null;
  }

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Validate final form
      if (!formData.name || !formData.phone || !formData.bio || !formData.experience || !formData.hourlyRate) {
        Alert.alert('Eroare', 'Te rog completează toate câmpurile obligatorii');
        return;
      }

      if (formData.selectedCategories.length === 0) {
        Alert.alert('Eroare', 'Te rog selectează cel puțin o categorie de servicii');
        return;
      }

      // Create professional profile
      const professionalData = {
        categories: formData.selectedCategories.join(','),
        hourlyRate: parseFloat(formData.hourlyRate),
        experience: parseInt(formData.experience),
        bio: formData.bio,
        certifications: formData.certifications,
        workingHours: JSON.stringify(formData.workingHours),
        serviceAreas: JSON.stringify(formData.serviceAreas),
        insurance: formData.hasInsurance,
      };

      const response = await apiClient.updateProfessionalProfile(professionalData);
      
      if (response.success) {
        Alert.alert(
          'Succes!',
          'Profilul profesional a fost creat cu succes!',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        throw new Error(response.error || 'Failed to create professional profile');
      }
    } catch (error) {
      console.error('Professional onboarding error:', error);
      Alert.alert('Eroare', 'Nu s-a putut crea profilul profesional. Te rog încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  const toggleWorkingDay = (day: keyof FormData['workingHours']) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          available: !prev.workingHours[day].available
        }
      }
    }));
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informații de bază</Text>
      <Text style={styles.stepDescription}>
        Completează informațiile de bază pentru profilul tău profesional
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <User size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Numele complet"
            value={formData.name}
            onChangeText={(text) => updateFormData({ name: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Phone size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Numărul de telefon"
            value={formData.phone}
            onChangeText={(text) => updateFormData({ phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <MapPin size={20} color="#64748b" style={styles.inputIcon} />
          <EnhancedLocationPicker
            selectedLocation={formData.location}
            onLocationSelect={(location) => updateFormData({ location })}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informații profesionale</Text>
      <Text style={styles.stepDescription}>
        Descrie experiența ta și tarifele pentru servicii
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <FileText size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrie experiența ta și serviciile oferite..."
            value={formData.bio}
            onChangeText={(text) => updateFormData({ bio: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Briefcase size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ani de experiență"
            value={formData.experience}
            onChangeText={(text) => updateFormData({ experience: text })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <DollarSign size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Tarif orar (RON)"
            value={formData.hourlyRate}
            onChangeText={(text) => updateFormData({ hourlyRate: text })}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Categorii de servicii</Text>
      <Text style={styles.stepDescription}>
        Selectează categoriile de servicii pe care le oferi
      </Text>

      <ScrollView style={styles.categoriesContainer} showsVerticalScrollIndicator={false}>
        {serviceCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              formData.selectedCategories.includes(category.id) && styles.categoryCardSelected
            ]}
            onPress={() => toggleCategory(category.id)}
          >
            <Text style={styles.categoryEmoji}>{category.icon}</Text>
            <View style={styles.categoryInfo}>
              <Text style={[
                styles.categoryName,
                formData.selectedCategories.includes(category.id) && styles.categoryNameSelected
              ]}>
                {category.name}
              </Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
            {formData.selectedCategories.includes(category.id) && (
              <Check size={20} color="#10b981" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Program de lucru</Text>
      <Text style={styles.stepDescription}>
        Configurează programul tău de lucru pentru fiecare zi
      </Text>

      <ScrollView style={styles.workingHoursContainer} showsVerticalScrollIndicator={false}>
        {Object.entries(formData.workingHours).map(([day, schedule]) => (
          <View key={day} style={styles.dayContainer}>
            <TouchableOpacity
              style={styles.dayHeader}
              onPress={() => toggleWorkingDay(day as keyof FormData['workingHours'])}
            >
              <Text style={styles.dayName}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Text>
              <View style={[
                styles.toggle,
                schedule.available && styles.toggleActive
              ]}>
                {schedule.available && <Check size={16} color="#ffffff" />}
              </View>
            </TouchableOpacity>

            {schedule.available && (
              <View style={styles.timeInputs}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>De la:</Text>
                  <TextInput
                    style={styles.timeInputField}
                    value={schedule.start}
                    onChangeText={(text) => updateFormData({
                      workingHours: {
                        ...formData.workingHours,
                        [day]: { ...schedule, start: text }
                      }
                    })}
                    placeholder="09:00"
                  />
                </View>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Până la:</Text>
                  <TextInput
                    style={styles.timeInputField}
                    value={schedule.end}
                    onChangeText={(text) => updateFormData({
                      workingHours: {
                        ...formData.workingHours,
                        [day]: { ...schedule, end: text }
                      }
                    })}
                    placeholder="17:00"
                  />
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Certificări și asigurări</Text>
      <Text style={styles.stepDescription}>
        Adaugă informații despre certificările și asigurările tale
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Award size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrie certificările tale (ex: certificat electrician, licență constructor...)"
            value={formData.certifications}
            onChangeText={(text) => updateFormData({ certifications: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.checkboxContainer,
            formData.hasInsurance && styles.checkboxContainerSelected
          ]}
          onPress={() => updateFormData({ hasInsurance: !formData.hasInsurance })}
        >
          <View style={[
            styles.checkbox,
            formData.hasInsurance && styles.checkboxSelected
          ]}>
            {formData.hasInsurance && <Check size={16} color="#ffffff" />}
          </View>
          <Text style={styles.checkboxLabel}>Am asigurare de răspundere profesională</Text>
        </TouchableOpacity>

        {formData.hasInsurance && (
          <View style={styles.inputContainer}>
            <FileText size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detalii despre asigurare (companie, numărul poliței, valoare...)"
              value={formData.insuranceDetails}
              onChangeText={(text) => updateFormData({ insuranceDetails: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        )}
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Zone de serviciu</Text>
      <Text style={styles.stepDescription}>
        Specifică zonele în care oferi servicii
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MapPin size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Listează zonele în care oferi servicii (ex: București Sector 1, Sector 2, Ilfov...)"
            value={formData.serviceAreas.join(', ')}
            onChangeText={(text) => updateFormData({ 
              serviceAreas: text.split(',').map(area => area.trim()).filter(area => area)
            })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Rezumat profil:</Text>
          <Text style={styles.summaryText}>• {formData.selectedCategories.length} categorii selectate</Text>
          <Text style={styles.summaryText}>• Tarif: {formData.hourlyRate} RON/oră</Text>
          <Text style={styles.summaryText}>• Experiență: {formData.experience} ani</Text>
          <Text style={styles.summaryText}>• Locație: {formData.location.city}, {formData.location.county}</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Pasul {step} din {totalSteps}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Înapoi</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>
            {isLoading ? 'Se salvează...' : step === totalSteps ? 'Finalizează' : 'Următorul'}
          </Text>
          {step < totalSteps && <ChevronRight size={20} color="#ffffff" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    paddingVertical: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    maxHeight: 400,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryCardSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  categoryNameSelected: {
    color: '#3b82f6',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  workingHoursContainer: {
    maxHeight: 400,
  },
  dayContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  timeInputs: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  timeInputField: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#111827',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  checkboxContainerSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#10b981',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  summaryContainer: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
