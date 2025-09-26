import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { supabaseApiClient, Job, JobApplication } from '@/services/supabaseApi';
import JobApplicationCard from '@/components/JobApplicationCard';
import JobApplicationForm from '@/components/JobApplicationForm';
import { 
  ArrowLeft, MapPin, Clock, DollarSign, User, 
  Calendar, AlertCircle, CheckCircle, MessageCircle, Send, 
  Edit, Trash2, MoreVertical 
} from 'lucide-react-native';


export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  useEffect(() => {
    if (id) {
      loadJobDetails();
    }
  }, [id]);

  const loadJobDetails = async () => {
    try {
      setIsLoading(true);
      const response = await supabaseApiClient.getJobById(id!);
      
      if (response.success && response.data) {
        console.log('Job data received:', response.data);
        setJob(response.data);
        
        // Load applications if user is the job owner or a professional
        if ((user?.role === 'CLIENT' && response.data.clientId === user.id) || user?.role === 'PROFESSIONAL') {
          await loadApplications();
        }
      } else {
        Alert.alert('Eroare', 'Nu s-a putut încărca detaliile job-ului');
        router.back();
      }
    } catch (error) {
      console.error('Error loading job details:', error);
      Alert.alert('Eroare', 'A apărut o eroare la încărcarea job-ului');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const response = await supabaseApiClient.getJobApplications(id!);
      if (response.success && response.data) {
        console.log('Applications loaded:', response.data);
        setApplications(response.data);
        
        // Check if current user has already applied
        if (user?.role === 'PROFESSIONAL') {
          const userApplication = response.data.find(app => app.professional_id === user.id);
          setHasApplied(!!userApplication);
        }
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadJobDetails();
    setIsRefreshing(false);
  };

  const handleAcceptApplication = async (applicationId: string) => {
    Alert.alert(
      'Acceptă aplicația',
      'Ești sigur că vrei să accepți această aplicație? Aceasta va închide job-ul pentru alte aplicații.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Acceptă',
          style: 'default',
          onPress: async () => {
            try {
              setIsProcessing(applicationId);
              const response = await supabaseApiClient.acceptJobApplication(applicationId);
              
              if (response.success) {
                Alert.alert('Succes!', 'Aplicația a fost acceptată cu succes!');
                await loadJobDetails(); // Refresh to show updated status
              } else {
                throw new Error(response.error || 'Failed to accept application');
              }
            } catch (error) {
              console.error('Error accepting application:', error);
              Alert.alert('Eroare', 'Nu s-a putut accepta aplicația. Te rog încearcă din nou.');
            } finally {
              setIsProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleRejectApplication = async (applicationId: string) => {
    Alert.alert(
      'Respinge aplicația',
      'Ești sigur că vrei să respingi această aplicație?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Respinge',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(applicationId);
              const response = await supabaseApiClient.rejectJobApplication(applicationId);
              
              if (response.success) {
                Alert.alert('Succes!', 'Aplicația a fost respinsă.');
                await loadJobDetails(); // Refresh to show updated status
              } else {
                throw new Error(response.error || 'Failed to reject application');
              }
            } catch (error) {
              console.error('Error rejecting application:', error);
              Alert.alert('Eroare', 'Nu s-a putut respinge aplicația. Te rog încearcă din nou.');
            } finally {
              setIsProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleMessageApplication = (applicationId: string) => {
    // Navigate to chat with the professional
    router.push(`/chat/${id}`);
  };

  const handleDeleteJob = async () => {
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
              setIsProcessing('delete');
              console.log('Attempting to delete job with ID:', id);
              const response = await supabaseApiClient.deleteJob(id!);
              console.log('Delete response:', response);
              if (response.success) {
                Alert.alert('Succes', 'Job-ul a fost șters cu succes', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              } else {
                console.error('Delete failed:', response.error);
                Alert.alert('Eroare', `Nu s-a putut șterge job-ul: ${response.error}`);
              }
            } catch (error) {
              console.error('Error deleting job:', error);
              Alert.alert('Eroare', 'A apărut o eroare la ștergerea job-ului');
            } finally {
              setIsProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleEditJob = () => {
    router.push(`/(tabs)/post-job?edit=${id}`);
  };

  const handleSubmitApplication = async (applicationData: {
    proposal: string;
    price: number;
    estimatedTime: string;
  }) => {
    if (!id) return;
    
    setIsSubmittingApplication(true);
    try {
      const response = await supabaseApiClient.applyForJob(id, applicationData, user?.id);
      
      if (response.success) {
        Alert.alert(
          'Succes!',
          'Aplicația ta a fost trimisă cu succes! Clientul va fi notificat.',
          [{ text: 'OK', onPress: () => {
            setShowApplicationForm(false);
            loadJobDetails(); // Refresh to show updated status
          }}]
        );
      } else {
        throw new Error(response.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      
      // Handle duplicate application error
      if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
        Alert.alert(
          'Aplicație deja trimisă',
          'Ai aplicat deja la acest job. Nu poți trimite o nouă aplicație.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Eroare', 'Nu s-a putut trimite aplicația. Te rog încearcă din nou.');
      }
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#10b981';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'COMPLETED': return '#6b7280';
      case 'CANCELLED': return '#ef4444';
      default: return '#f59e0b';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f59e0b';
      case 'NORMAL': return '#3b82f6';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'Urgent';
      case 'HIGH': return 'Ridicată';
      case 'NORMAL': return 'Normală';
      case 'LOW': return 'Scăzută';
      default: return 'Necunoscută';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Se încarcă...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={styles.errorText}>Job-ul nu a fost găsit</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Înapoi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const location = job.location ? JSON.parse(job.location) : { city: 'N/A', county: 'N/A' };
  const budget = { min: job.budgetMin, max: job.budgetMax };
  const isClient = user?.role === 'CLIENT';
  const hasApplications = job.applications && job.applications.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalii job</Text>
        {isClient && job.clientId === user?.id && job.status === 'OPEN' && (
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={handleEditJob}
              disabled={isProcessing === 'delete'}
            >
              <Edit size={20} color="#f59e0b" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={handleDeleteJob}
              disabled={isProcessing === 'delete'}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
        {(!isClient || job.clientId !== user?.id || job.status !== 'OPEN') && (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
              <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(job.priority) }]}>
              <Text style={styles.priorityText}>{getPriorityText(job.priority)}</Text>
            </View>
          </View>
          
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.jobCategory}>{job.category}</Text>
        </View>

        {/* Job Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Detalii</Text>
          
          <View style={styles.detailItem}>
            <MapPin size={20} color="#6b7280" />
            <Text style={styles.detailText}>
              {location.city}, {location.county}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <DollarSign size={20} color="#6b7280" />
            <Text style={styles.detailText}>
              {budget.min && budget.max 
                ? `${budget.min} - ${budget.max} RON`
                : 'Preț negociabil'
              }
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Calendar size={20} color="#6b7280" />
            <Text style={styles.detailText}>
              Postat pe {formatDate(job.createdAt)}
            </Text>
          </View>

          {job.client && (
            <View style={styles.detailItem}>
              <User size={20} color="#6b7280" />
              <Text style={styles.detailText}>
                Client: {job.client.name}
              </Text>
            </View>
          )}
        </View>

        {/* Job Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descriere</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>

        {/* Applications Section */}
        {isClient && job.clientId === user?.id && (
          <View style={styles.applicationsSection}>
            <View style={styles.applicationsHeader}>
              <Text style={styles.sectionTitle}>
                Aplicații ({applications.length})
              </Text>
              {applications.length > 0 && (
                <View style={styles.applicationsStatus}>
                  <CheckCircle size={16} color="#10b981" />
                  <Text style={styles.applicationsStatusText}>
                    {applications.filter(app => app.status === 'ACCEPTED').length} acceptate
                  </Text>
                </View>
              )}
            </View>

            {applications.length > 0 ? (
              applications.map((application) => (
                <JobApplicationCard
                  key={application.id}
                  application={application}
                  onAccept={handleAcceptApplication}
                  onReject={handleRejectApplication}
                  onMessage={handleMessageApplication}
                  showActions={job.status === 'OPEN'}
                />
              ))
            ) : (
              <View style={styles.noApplicationsContainer}>
                <MessageCircle size={48} color="#d1d5db" />
                <Text style={styles.noApplicationsTitle}>
                  Nicio aplicație încă
                </Text>
                <Text style={styles.noApplicationsText}>
                  Aplicațiile profesioniștilor vor apărea aici
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Professional Application Section */}
        {!isClient && user?.role === 'PROFESSIONAL' && job.status === 'OPEN' && (
          <View style={styles.professionalSection}>
            {hasApplied ? (
              <View style={styles.applicationStatus}>
                <CheckCircle size={24} color="#10b981" />
                <Text style={styles.applicationStatusTitle}>Aplicație trimisă</Text>
                <Text style={styles.applicationStatusText}>
                  Ai aplicat deja la acest job. Clientul va fi notificat și va putea să te contacteze.
                </Text>
              </View>
            ) : showApplicationForm ? (
              <JobApplicationForm
                jobId={id!}
                onSubmit={handleSubmitApplication}
                onCancel={() => setShowApplicationForm(false)}
                isLoading={isSubmittingApplication}
              />
            ) : (
              <View style={styles.applicationPrompt}>
                <Text style={styles.sectionTitle}>Interesat de acest job?</Text>
                <Text style={styles.applicationPromptText}>
                  Trimite o propunere cu prețul și timpul estimat pentru a aplica la acest job.
                </Text>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowApplicationForm(true)}
                >
                  <Send size={20} color="#ffffff" />
                  <Text style={styles.applyButtonText}>Aplică pentru job</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 24,
  },
  jobHeader: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  jobCategory: {
    fontSize: 16,
    color: '#6b7280',
  },
  detailsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
  },
  descriptionSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  applicationsSection: {
    marginBottom: 32,
  },
  applicationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  applicationsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  applicationsStatusText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  noApplicationsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  noApplicationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  noApplicationsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  professionalSection: {
    marginBottom: 32,
  },
  applicationPrompt: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  applicationPromptText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  applicationStatus: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  applicationStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#059669',
    marginTop: 12,
    marginBottom: 8,
  },
  applicationStatusText: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 20,
  },
});
