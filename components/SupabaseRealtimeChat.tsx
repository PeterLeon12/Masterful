import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { supabase } from '@/services/supabaseRealtimeService';

interface ChatMessage {
  id: string;
  content: string;
  user: {
    name: string;
    id?: string;
  };
  createdAt: string;
  roomName: string;
}

interface SupabaseRealtimeChatProps {
  jobId: string;
  recipientId: string;
  recipientName: string;
}

export const SupabaseRealtimeChat: React.FC<SupabaseRealtimeChatProps> = ({
  jobId,
  recipientId,
  recipientName,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const roomName = `job-${jobId}`;

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [jobId]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${roomName}`)
      .on(
        'broadcast',
        { event: 'message' },
        (payload) => {
          const newMessage = payload.payload as ChatMessage;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          scrollToBottom();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Connected to chat room:', roomName);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error connecting to chat room');
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomName]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(name)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      const formattedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        user: {
          name: msg.sender?.name || 'Unknown',
          id: msg.sender_id,
        },
        createdAt: msg.created_at,
        roomName: `job-${msg.job_id}`,
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageId = Date.now().toString();
    const message: ChatMessage = {
      id: messageId,
      content: newMessage.trim(),
      user: {
        name: user.name,
        id: user.id,
      },
      createdAt: new Date().toISOString(),
      roomName,
    };

    try {
      // Store message in database
      const { error: dbError } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          content: message.content,
          sender_id: user.id,
          recipient_id: recipientId,
          job_id: jobId,
          message_type: 'TEXT',
          is_read: false,
        });

      if (dbError) {
        console.error('Error storing message:', dbError);
        return;
      }

      // Broadcast message to all subscribers
      const broadcastResponse = await supabase
        .channel(`chat:${roomName}`)
        .send({
          type: 'broadcast',
          event: 'message',
          payload: message,
        });

      if (broadcastResponse === 'error') {
        console.error('Error broadcasting message');
        return;
      }

      // Add message to local state
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.user.id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {new Date(item.createdAt).toLocaleTimeString('ro-RO', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Se încarcă mesajele...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName}>{recipientName}</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#4CAF50' : '#FF5722' }
            ]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Conectat' : 'Deconectat'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Scrie un mesaj..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: newMessage.trim() ? 1 : 0.5 }
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#e0e7ff',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    color: '#111827',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});