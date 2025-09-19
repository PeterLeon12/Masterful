import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cjvrtumhlvbmuryremlw.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdnJ0dW1obHZibXVyeXJlbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDA1MDEsImV4cCI6MjA3MzY3NjUwMX0.UcTB6xreDPpuMCEsU-FT_3jMRnhG-2VjK0o6hbx4h_g';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Message {
  id: string;
  job_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  recipient?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface TypingIndicator {
  user_id: string;
  user_name: string;
  is_typing: boolean;
  timestamp: number;
}

export class SupabaseRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private typingChannels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to messages for a specific job
  subscribeToMessages(
    jobId: string,
    onMessage: (message: Message) => void,
    onError?: (error: any) => void
  ): RealtimeChannel {
    const channelName = `messages:${jobId}`;
    
    // Unsubscribe from existing channel if it exists
    if (this.channels.has(channelName)) {
      this.unsubscribeFromMessages(jobId);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          onMessage(payload.new as Message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          console.log('Message updated:', payload);
          onMessage(payload.new as Message);
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to messages for job: ${jobId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to messages');
          onError?.(new Error('Failed to subscribe to messages'));
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to typing indicators for a specific job
  subscribeToTyping(
    jobId: string,
    onTyping: (typing: TypingIndicator) => void,
    onError?: (error: any) => void
  ): RealtimeChannel {
    const channelName = `typing:${jobId}`;
    
    // Unsubscribe from existing channel if it exists
    if (this.typingChannels.has(channelName)) {
      this.unsubscribeFromTyping(jobId);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'typing' },
        (payload) => {
          console.log('Typing indicator received:', payload);
          onTyping(payload.payload as TypingIndicator);
        }
      )
      .subscribe((status) => {
        console.log('Typing subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to typing for job: ${jobId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to typing');
          onError?.(new Error('Failed to subscribe to typing'));
        }
      });

    this.typingChannels.set(channelName, channel);
    return channel;
  }

  // Send typing indicator
  async sendTypingIndicator(
    jobId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    const channelName = `typing:${jobId}`;
    const channel = this.typingChannels.get(channelName);
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: userId,
          user_name: userName,
          is_typing: isTyping,
          timestamp: Date.now()
        }
      });
    }
  }

  // Unsubscribe from messages
  unsubscribeFromMessages(jobId: string): void {
    const channelName = `messages:${jobId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`Unsubscribed from messages for job: ${jobId}`);
    }
  }

  // Unsubscribe from typing
  unsubscribeFromTyping(jobId: string): void {
    const channelName = `typing:${jobId}`;
    const channel = this.typingChannels.get(channelName);
    
    if (channel) {
      supabase.removeChannel(channel);
      this.typingChannels.delete(channelName);
      console.log(`Unsubscribed from typing for job: ${jobId}`);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    // Unsubscribe from all message channels
    for (const [channelName, channel] of this.channels) {
      supabase.removeChannel(channel);
    }
    this.channels.clear();

    // Unsubscribe from all typing channels
    for (const [channelName, channel] of this.typingChannels) {
      supabase.removeChannel(channel);
    }
    this.typingChannels.clear();

    console.log('Unsubscribed from all channels');
  }

  // Get connection status
  getConnectionStatus(): string {
    return supabase.realtime.getChannels().length > 0 ? 'CONNECTED' : 'DISCONNECTED';
  }
}

// Export singleton instance
export const supabaseRealtimeService = new SupabaseRealtimeService();
