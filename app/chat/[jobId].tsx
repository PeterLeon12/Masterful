import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { useSocket } from '@/hooks/useSocket';
import { apiClient } from '@/services/api';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
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
  const { isConnected, joinJob, leaveJob, sendMessage, startTyping, stopTyping, onNewMessage, onUserTyping, off } = useSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
      loadMessages();
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      // Join job room
      joinJob(jobId);

      // Listen for new messages
      onNewMessage(handleNewMessage);
      
      // Listen for typing indicators
      onUserTyping(handleUserTyping);

      return () => {
        off('new-message');
        off('user-typing');
        off('user-stopped-typing');
        leaveJob(jobId);
      };
    }
  }, [jobId, joinJob, leaveJob, onNewMessage, onUserTyping, off]);

  const loadJobDetails = async () => {
    try {
      const response = await apiClient.getJobById(jobId!);
      if (response.success && response.data) {
        setJob(response.data);
      }
    } catch (error) {
      console.error('Error loading job details:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMessages(jobId!, 50, 0);
      
      if (response.success && response.data) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Eroare', 'Nu s-au putut încărca mesajele');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (data: any) => {
    const message: Message = {
      ...data,
      senderName: data.senderName || data.sender?.name || 'Unknown'
    };
    setMessages(prev => [...prev, message]);
    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleUserTyping = (data: any) => {
    const userName = data.userName || data.user?.name || 'Someone';
    if (data.userId !== user?.id) {
      setIsTyping(true);
      setTypingUser(userName);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingUser('');
      }, 3000);
    }
  };

  const handleUserStoppedTyping = (data: { userId: string }) => {
    if (data.userId !== user?.id) {
      setIsTyping(false);
      setTypingUser('');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleSendMessage = async (content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION') => {
    if (!isConnected) {
      Alert.alert('Eroare', 'Conexiunea la chat nu este disponibilă');
      return;
    }

    try {
      setIsSending(true);
      
      const response = await apiClient.sendMessage(jobId!, {
        content,
        messageType,
      });

      if (response.success) {
        // Message will be added via socket event
        // Stop typing indicator
        stopTyping({ recipientId: getOtherUser()?.id || '', jobId });
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Eroare', 'Nu s-a putut trimite mesajul');
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (isConnected) {
      startTyping({ recipientId: getOtherUser()?.id || '', jobId });
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

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessage message={item} />
  );

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

  const renderTypingIndicator = () => (
    <TypingIndicator isVisible={isTyping} userName={typingUser} />
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
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={renderTypingIndicator}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          onSendImage={() => Alert.alert('Funcție în dezvoltare', 'Trimiterea imaginilor va fi disponibilă în curând.')}
          onSendFile={() => Alert.alert('Funcție în dezvoltare', 'Trimiterea fișierelor va fi disponibilă în curând.')}
          onSendLocation={() => Alert.alert('Funcție în dezvoltare', 'Trimiterea locației va fi disponibilă în curând.')}
          disabled={isSending || !isConnected}
          placeholder={isConnected ? "Scrie un mesaj..." : "Conectare la chat..."}
        />
      </KeyboardAvoidingView>
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
