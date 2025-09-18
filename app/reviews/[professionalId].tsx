import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, Star } from 'lucide-react-native';
import ReviewsList from '@/components/ReviewsList';
import ReviewForm from '@/components/ReviewForm';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/services/api';
import { useApiError } from '@/hooks/useApiError';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    name: string;
    avatar?: string;
  };
  job?: {
    title: string;
    category: string;
  };
  helpful?: number;
  reported?: boolean;
}

interface Professional {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating?: number;
  reviewCount?: number;
}

export default function ProfessionalReviewsScreen() {
  const { professionalId } = useLocalSearchParams<{ professionalId: string }>();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const { error, clearError } = useApiError();

  // Fetch professional data
  const { data: professionalData, isLoading: professionalLoading } = useApi(
    useCallback(() => apiClient.getProfessional(professionalId), [professionalId]),
  );

  // Fetch reviews data
  const { 
    data: reviewsData, 
    isLoading: reviewsLoading, 
    refresh: refreshReviews 
  } = useApi(
    useCallback(() => apiClient.get(`/professionals/${professionalId}/reviews`), [professionalId]),
  );

  useEffect(() => {
    if (professionalData) {
      setProfessional(professionalData as any);
    }
  }, [professionalData]);

  const reviews: Review[] = (reviewsData as any) || [];

  const handleSubmitReview = async (reviewData: { rating: number; comment: string }) => {
    try {
      // In a real app, this would call the API to submit the review
      console.log('Submitting review:', reviewData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Succes',
        'Recenzia ta a fost trimisă cu succes!',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowReviewForm(false);
              refreshReviews();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut trimite recenzia. Te rog încearcă din nou.');
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      // In a real app, this would call the API to mark review as helpful
      console.log('Marking review as helpful:', reviewId);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert('Succes', 'Mulțumim pentru feedback!');
      refreshReviews();
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut actualiza recenzia.');
    }
  };

  const handleReport = async (reviewId: string) => {
    Alert.alert(
      'Raportează recenzie',
      'Ești sigur că vrei să raportezi această recenzie?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Raportează',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, this would call the API to report the review
              console.log('Reporting review:', reviewId);
              
              // Mock API call
              await new Promise(resolve => setTimeout(resolve, 500));
              
              Alert.alert('Succes', 'Recenzia a fost raportată. Vom examina conținutul.');
            } catch (error) {
              Alert.alert('Eroare', 'Nu s-a putut raporta recenzia.');
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#374151" />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Recenzii</Text>
        {professional && (
          <Text style={styles.headerSubtitle}>
            pentru {professional.user.name}
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.addReviewButton}
        onPress={() => setShowReviewForm(true)}
      >
        <Plus size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  const renderProfessionalInfo = () => {
    if (!professional) return null;

    return (
      <View style={styles.professionalInfo}>
        <View style={styles.professionalAvatar}>
          <Text style={styles.professionalAvatarText}>
            {professional.user.avatar || professional.user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.professionalDetails}>
          <Text style={styles.professionalName}>{professional.user.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.rating}>
              {professional.rating?.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.reviewCount}>
              ({professional.reviewCount || 0} recenzii)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {renderProfessionalInfo()}
      
      <ReviewsList
        reviews={reviews}
        isLoading={reviewsLoading}
        onRefresh={refreshReviews}
        onHelpful={handleHelpful}
        onReport={handleReport}
        showJobDetails={true}
      />

      {/* Review Form Modal */}
      <Modal
        visible={showReviewForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ReviewForm
          jobId="mock-job-id" // In a real app, this would come from navigation params
          professionalId={professionalId || ''}
          professionalName={professional?.user.name || 'Meșter'}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewForm(false)}
          isLoading={false}
        />
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  addReviewButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  professionalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  professionalAvatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
});
