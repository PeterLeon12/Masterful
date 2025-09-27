import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { supabaseApiClient } from '@/services/supabaseApi';
import { RealtimeChat } from '@/components/RealtimeChat';
import { ArrowLeft, User, Phone } from 'lucide-react-native';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION';
}

interface Job {
  id: string;
  title: string;
  client?: {
    id: string;
    name: string;
    phone?: string;
  };
  professional?: {
    id: string;
    name: string;
    phone?: string;
  };
  location: string;
}

export default function ChatScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { user } = useAuth();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
    }
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      const response = await supabaseApiClient.getJobById(jobId!);
      if (response.success && response.data) {
        setJob(response.data);
      }
    } catch (error) {
      console.error('Error loading job details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOtherUser = () => {
    if (!job || !user) return null;
    
    if (user.role === 'CLIENT') {
      return job.professional;
    } else {
      return job.client;
    }
  };

  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('Utilizator');
  const [isLoadingOtherUser, setIsLoadingOtherUser] = useState(false);

  useEffect(() => {
    if (job && user) {
      loadOtherUser();
    }
  }, [job, user]);

  const loadOtherUser = async () => {
    try {
      setIsLoadingOtherUser(true);
      console.log('Loading other user for job:', jobId, 'User role:', user?.role);
      
      // For CLIENT: find any professional who applied to their job
      if (user?.role === 'CLIENT') {
        try {
          const response = await supabaseApiClient.getJobApplications(jobId!);
          console.log('Job applications response for client:', response);
          
          if (response.success && response.data && response.data.length > 0) {
            // Find the first professional who applied (not the current user)
            const professionalApplication = response.data.find(app => 
              app.professional_id !== user?.id
            );
            console.log('Found professional application:', professionalApplication);
            if (professionalApplication) {
              setOtherUserId(professionalApplication.professional_id);
              setOtherUserName(professionalApplication.professional?.name || 'Utilizator');
              console.log('Set otherUserId for client:', professionalApplication.professional_id);
              setIsLoadingOtherUser(false);
              return;
            }
          }
        } catch (appError) {
          console.log('Could not load applications for client:', appError);
        }
        
        // Fallback: use job's professional if available
        if (job?.professional) {
          setOtherUserId(job.professional.id);
          setOtherUserName(job.professional.name || 'Utilizator');
          console.log('Set otherUserId from job professional for client:', job.professional.id);
          setIsLoadingOtherUser(false);
          return;
        }
      }
      
      // For PROFESSIONAL: find the client who posted the job
      if (user?.role === 'PROFESSIONAL') {
        // Use the job's client directly
        if (job?.client) {
          setOtherUserId(job.client.id);
          setOtherUserName(job.client.name || 'Client');
          console.log('Set otherUserId from job client for professional:', job.client.id);
          setIsLoadingOtherUser(false);
          return;
        }
      }
      
      // If we get here, we couldn't determine the other user
      console.error('Could not determine other user');
      setIsLoadingOtherUser(false);
    } catch (error) {
      console.error('Error loading other user:', error);
      setIsLoadingOtherUser(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        
               <View style={styles.userInfo}>
                 <Text style={styles.userName}>
                   {otherUserName}
                 </Text>
                 <Text style={styles.jobTitle}>
                   {job?.title || 'Job'}
                 </Text>
               </View>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Phone size={20} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <User size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading || isLoadingOtherUser) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Se încarcă conversația...</Text>
        </View>
      </SafeAreaView>
    );
  }

        return (
          <SafeAreaView style={styles.container}>
            {renderHeader()}
            
            {otherUserId ? (
              <RealtimeChat
                roomName={`job-${jobId}`}
                recipientId={otherUserId}
                recipientName={otherUserName}
              />
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Se încarcă conversația...</Text>
              </View>
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  jobTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
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
});
