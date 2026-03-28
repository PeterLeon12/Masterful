import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { supabaseApiClient, Job } from '@/services/supabaseApi';
import { ArrowLeft, MapPin, Clock, DollarSign, Edit, Trash2, Eye, Plus } from 'lucide-react-native';

export default function MyJobsScreen() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.role === 'CLIENT') {
      loadMyJobs();
    }
  }, [user]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.role === 'CLIENT') {
        loadMyJobs();
      }
    }, [user])
  );

  const loadMyJobs = async () => {
    try {
      setIsLoading(true);
      const response = await supabaseApiClient.getJobsByClient(user?.id);
      if (response.success && response.data) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading my jobs:', error);
      Alert.alert('Eroare', 'Nu s-au putut încărca job-urile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyJobs();
    setRefreshing(false);
  };

  const handleDeleteJob = async (jobId: string) => {
    Alert.alert(
      'Șterge job-ul',
      'Ești sigur că vrei să ștergi acest job? Această acțiune nu poate fi anulată.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Attempting to delete job with ID:', jobId);
              const response = await supabaseApiClient.deleteJob(jobId);
              console.log('Delete response:', response);
              if (response.success) {
                // Remove job from local state immediately
                setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
                Alert.alert('Succes', 'Job-ul a fost șters cu succes');
                // Also refresh from server to ensure consistency
                loadMyJobs();
              } else {
                console.error('Delete failed:', response.error);
                Alert.alert('Eroare', `Nu s-a putut șterge job-ul: ${response.error}`);
              }
            } catch (error) {
              console.error('Error deleting job:', error);
              Alert.alert('Eroare', 'A apărut o eroare la ștergerea job-ului');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#10b981';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'COMPLETED': return '#6b7280';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Deschis';
      case 'IN_PROGRESS': return 'În progres';
      case 'COMPLETED': return 'Finalizat';
      case 'CANCELLED': return 'Anulat';
      default: return 'Necunoscut';
    }
  };

  const renderJobCard = (job: Job) => {
    const location = job.location ? JSON.parse(job.location) : { city: 'N/A', county: 'N/A' };
    const budget = { min: job.budgetMin, max: job.budgetMax };
    
    return (
      <View key={job.id} style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
            <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
          </View>
        </View>
        
        <View style={styles.jobDetails}>
          <View style={styles.jobDetail}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.jobDetailText}>
              {location.county}, {location.city}
            </Text>
          </View>
          <View style={styles.jobDetail}>
            <Clock size={14} color="#6b7280" />
            <Text style={styles.jobDetailText}>
              {new Date(job.createdAt).toLocaleDateString('ro-RO')}
            </Text>
          </View>
        </View>

        <View style={styles.jobFooter}>
          <Text style={styles.jobPrice}>
            {budget.min && budget.max 
              ? `${budget.min}-${budget.max} RON`
              : 'Preț negociabil'
            }
          </Text>
          
          <View style={styles.jobActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/job/${job.id}`)}
            >
              <Eye size={16} color="#3b82f6" />
            </TouchableOpacity>
            
            {job.status === 'OPEN' && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/(tabs)/post-job?edit=${job.id}`)}
                >
                  <Edit size={16} color="#f59e0b" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteJob(job.id)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (user?.role !== 'CLIENT') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Această pagină este disponibilă doar pentru clienți
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Înapoi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job-urile mele</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/post-job')}
        >
          <Plus size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Se încarcă...</Text>
          </View>
        ) : jobs.length > 0 ? (
          <View style={styles.jobsList}>
            {jobs.map(renderJobCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Nu ai postat niciun job încă</Text>
            <Text style={styles.emptyStateText}>
              Creează primul tău job pentru a găsi profesioniști calificați
            </Text>
            <TouchableOpacity
              style={styles.createJobButton}
              onPress={() => router.push('/(tabs)/post-job')}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.createJobButtonText}>Postează primul job</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  jobDetails: {
    gap: 4,
    marginBottom: 12,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobDetailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  jobActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createJobButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
});

