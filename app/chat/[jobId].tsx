import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { apiClient } from '@/services/api';
import { SupabaseRealtimeChat } from '@/components/SupabaseRealtimeChat';
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
      const response = await apiClient.getJobById(jobId!);
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

  const otherUser = getOtherUser();

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
            {otherUser?.name || 'Utilizator'}
          </Text>
          <Text style={styles.jobTitle}>
            {job?.title || 'Job'}
          </Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        {otherUser?.phone && (
          <TouchableOpacity style={styles.actionButton}>
            <Phone size={20} color="#3b82f6" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton}>
          <User size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
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
      
      <SupabaseRealtimeChat
        roomName={`job-${jobId}`}
        username={user?.name || 'User'}
        onMessage={(messages) => {
          // Optional: Handle message updates
          console.log('Messages updated:', messages.length);
        }}
      />
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
