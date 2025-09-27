import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { supabaseApiClient } from '@/services/supabaseApi';
import { Search, Star, MapPin, MessageSquare, ArrowLeft } from 'lucide-react-native';

interface Location {
  county: string;
  city: string;
}

export default function ProfessionalSearchScreen() {
  const { user } = useAuth();
  const { jobId, jobTitle, jobCategory } = useLocalSearchParams<{ jobId: string; jobTitle: string; jobCategory: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const professionalsFilters = useMemo(() => {
    const filters: {
      categories?: string[];
      location?: string;
      county?: string;
      city?: string;
      searchQuery?: string;
      limit?: number;
      offset?: number;
    } = {};

    if (searchQuery.trim()) {
      filters.searchQuery = searchQuery.trim();
    }

    if (jobCategory) {
      filters.categories = [jobCategory];
    }

    if (selectedLocation) {
      filters.county = selectedLocation.county;
      filters.city = selectedLocation.city;
    }

    return filters;
  }, [searchQuery, jobCategory, selectedLocation]);

  const loadProfessionals = async () => {
    try {
      setIsLoading(true);
      const response = await supabaseApiClient.getProfessionals(professionalsFilters);
      if (response.success && response.data) {
        setProfessionals(response.data.professionals || []);
      }
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadProfessionals();
  }, [professionalsFilters]);

  const handleMessageProfessional = async (professionalId: string, professionalName: string) => {
    if (!user?.id || !jobId) {
      Alert.alert('Eroare', 'Utilizator neautentificat sau ID job lipsă.');
      return;
    }

    setIsSendingMessage(true);
    try {
      // Send an initial message to start the conversation
      const initialMessageContent = `Bună ziua, sunt interesat de job-ul "${jobTitle}" și aș dori să discut mai multe detalii.`;
      const response = await supabaseApiClient.sendMessage(jobId, {
        content: initialMessageContent,
        recipientId: professionalId,
      });

      if (response.success) {
        Alert.alert('Succes', `Mesajul a fost trimis către ${professionalName}.`);
        router.push(`/chat/${jobId}`); // Navigate to the chat screen for this job
      } else {
        Alert.alert('Eroare', response.error || 'Nu s-a putut trimite mesajul.');
      }
    } catch (error) {
      console.error('Error sending initial message:', error);
      Alert.alert('Eroare', 'A apărut o eroare la trimiterea mesajului.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const renderProfessionalCard = ({ item }: { item: any }) => (
    <View style={styles.professionalCard}>
      <View style={styles.professionalHeader}>
        <View style={styles.professionalAvatar}>
          <Text style={styles.professionalAvatarText}>{item.user?.name ? item.user.name[0] : '?'}</Text>
        </View>
        <View style={styles.professionalInfo}>
          <Text style={styles.professionalName}>{item.user?.name || 'Nume necunoscut'}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount} recenzii)</Text>
          </View>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.location}>{item.serviceAreas?.join(', ') || 'N/A'}</Text>
          </View>
        </View>
        <View style={styles.professionalStats}>
          <Text style={styles.price}>{item.hourlyRate} RON/oră</Text>
        </View>
      </View>
      
      {item.bio && (
        <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
      )}
      
      <View style={styles.specialtiesContainer}>
        {item.categories?.map((category: string, index: number) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{category}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => handleMessageProfessional(item.userId, item.user?.name || 'profesionist')}
        disabled={isSendingMessage}
      >
        {isSendingMessage ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <MessageSquare size={20} color="#ffffff" />
        )}
        <Text style={styles.messageButtonText}>Trimite mesaj</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Căutare Profesioniști</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchBar}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Caută după nume, categorie sau descriere"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {jobTitle && (
        <Text style={styles.jobContextText}>
          Profesioniști pentru job-ul: <Text style={styles.jobContextTitle}>{jobTitle}</Text>
        </Text>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Se încarcă profesioniștii...</Text>
        </View>
      ) : professionals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Nu am găsit profesioniști care să corespundă criteriilor tale.</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadProfessionals}>
            <Text style={styles.refreshButtonText}>Reîmprospătează</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={professionals}
          keyExtractor={(item) => item.id}
          renderItem={renderProfessionalCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  jobContextText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  jobContextTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  professionalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  professionalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  professionalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionalAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  professionalStats: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  bio: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  messageButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
