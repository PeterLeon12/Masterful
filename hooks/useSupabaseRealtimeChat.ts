import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabaseRealtimeService';

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    name: string;
    id?: string;
  };
  createdAt: string;
  roomName: string;
}

export interface UseSupabaseRealtimeChatOptions {
  roomName: string;
  username: string;
  userId?: string;
  onMessage?: (messages: ChatMessage[]) => void;
  initialMessages?: ChatMessage[];
}

export const useSupabaseRealtimeChat = ({
  roomName,
  username,
  userId,
  onMessage,
  initialMessages = [],
}: UseSupabaseRealtimeChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial messages from database
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(name),
          recipient:users!messages_recipient_id_fkey(name)
        `)
        .eq('job_id', roomName.replace('job-', ''))
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        setError('Failed to load messages');
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
      onMessage?.(formattedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [roomName, onMessage]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const jobId = roomName.replace('job-', '');
    const messageId = Date.now().toString();

    try {
      setError(null);
      
      // Store message in database
      const { data: messageData, error: dbError } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          content: content.trim(),
          sender_id: userId || 'anonymous',
          recipient_id: 'system', // We'll need to get the actual recipient
          job_id: jobId,
          message_type: 'TEXT',
          is_read: false,
        })
        .select(`
          *,
          sender:users!messages_sender_id_fkey(name)
        `)
        .single();

      if (dbError) {
        console.error('Error storing message:', dbError);
        setError('Failed to send message');
        return;
      }

      // Format message for real-time broadcast
      const message: ChatMessage = {
        id: messageData.id,
        content: messageData.content,
        user: {
          name: messageData.sender?.name || username,
          id: messageData.sender_id,
        },
        createdAt: messageData.created_at,
        roomName,
      };

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
        setError('Failed to broadcast message');
        return;
      }

      // Add message to local state
      setMessages(prev => {
        const updated = [...prev, message];
        onMessage?.(updated);
        return updated;
      });

      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, [roomName, username, userId, onMessage]);

  // Subscribe to real-time updates
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
            const updated = [...prev, newMessage];
            onMessage?.(updated);
            return updated;
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
          console.log('Connected to chat room:', roomName);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error connecting to chat room');
          setIsConnected(false);
          setError('Failed to connect to chat');
        }
      });

    // Load initial messages
    loadMessages();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomName, loadMessages]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    loadMessages,
  };
};
