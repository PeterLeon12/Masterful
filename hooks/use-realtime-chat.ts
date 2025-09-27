import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabaseRealtimeService';

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    name: string;
    id: string;
  };
  createdAt: string;
  roomName: string;
}

interface UseRealtimeChatProps {
  roomName: string;
  userId: string;
  userName: string;
  recipientId: string;
  professionalId?: string; // Added to filter messages by specific professional
  onMessage?: (messages: ChatMessage[]) => void;
  initialMessages?: ChatMessage[];
}

export const useRealtimeChat = ({
  roomName,
  userId,
  userName,
  recipientId,
  professionalId,
  onMessage,
  initialMessages = []
}: UseRealtimeChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial messages from database
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          recipient_id,
          created_at,
          sender:users!messages_sender_id_fkey(id, name)
        `)
        .eq('job_id', roomName.replace('job-', ''))
        .order('created_at', { ascending: true });

      // If professionalId is provided, filter messages to only show those between the current user and that specific professional
      if (professionalId) {
        query = query.or(`and(sender_id.eq.${userId},recipient_id.eq.${professionalId}),and(sender_id.eq.${professionalId},recipient_id.eq.${userId})`);
      }

      const { data, error } = await query;

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
        roomName,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [roomName, userId, professionalId]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      console.log('Sending message with recipientId:', recipientId);
      
      // Validate recipientId before sending
      if (!recipientId || recipientId === 'null' || recipientId === 'unknown') {
        console.error('Invalid recipientId:', recipientId);
        return;
      }

      // Store message in database
      const { data: insertedMessage, error: dbError } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          sender_id: userId,
          recipient_id: recipientId,
          job_id: roomName.replace('job-', ''),
          message_type: 'TEXT',
          is_read: false,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error storing message:', dbError);
        return;
      }

      const newMessage: ChatMessage = {
        id: insertedMessage.id,
        content: insertedMessage.content,
        user: {
          name: userName,
          id: userId,
        },
        createdAt: insertedMessage.created_at,
        roomName,
      };

      // Add to local state
      setMessages(prev => [...prev, newMessage]);
      
      // Call onMessage callback if provided
      if (onMessage) {
        onMessage([...messages, newMessage]);
      }

      // Broadcast to other users via realtime
      const { error: broadcastError } = await supabase
        .channel(`chat:${roomName}`)
        .send({
          type: 'broadcast',
          event: 'message',
          payload: newMessage,
        });

      if (broadcastError) {
        console.error('Error broadcasting message:', broadcastError);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [userId, userName, roomName, messages, onMessage]);

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${roomName}`)
      .on('broadcast', { event: 'message' }, (payload) => {
        const message = payload.payload as ChatMessage;
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(msg => msg.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Load initial messages
    loadMessages();

    return () => {
      channel.unsubscribe();
    };
  }, [roomName, loadMessages]);

  return {
    messages,
    sendMessage,
    isConnected,
    isLoading,
    loadMessages,
  };
};
