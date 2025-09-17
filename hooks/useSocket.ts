import { useEffect, useRef, useState } from 'react';
import { socketService, MessageData, TypingData, JobUpdateData, NotificationData, ProfessionalStatusData } from '@/services/socketService';
import { useAuth } from '@/contexts/OptimalAuthContext';
import { logger } from '@/utils/logger';

interface UseSocketReturn {
  isConnected: boolean;
  joinJob: (jobId: string) => void;
  leaveJob: (jobId: string) => void;
  sendMessage: (data: {
    recipientId: string;
    message: string;
    jobId: string;
  }) => void;
  startTyping: (data: { recipientId: string; jobId: string }) => void;
  stopTyping: (data: { recipientId: string; jobId: string }) => void;
  setOnlineStatus: (status: boolean) => void;
  onNewMessage: (callback: (data: MessageData) => void) => void;
  onUserTyping: (callback: (data: TypingData) => void) => void;
  onJobUpdate: (callback: (data: JobUpdateData) => void) => void;
  onNotification: (callback: (data: NotificationData) => void) => void;
  onProfessionalStatusChange: (callback: (data: ProfessionalStatusData) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

export const useSocket = (): UseSocketReturn => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const connectionAttempted = useRef(false);

  useEffect(() => {
    const connectSocket = async () => {
      if (!user || connectionAttempted.current) {
        return;
      }

      try {
        connectionAttempted.current = true;
        await socketService.connect();
        setIsConnected(true);
        logger.info('Socket connected via useSocket hook');
      } catch (error) {
        logger.error('Failed to connect socket in useSocket hook:', error);
        setIsConnected(false);
      }
    };

    connectSocket();

    // Cleanup on unmount
    return () => {
      if (connectionAttempted.current) {
        socketService.disconnect();
        setIsConnected(false);
        connectionAttempted.current = false;
      }
    };
  }, [user]);

  // Update connection status when socket status changes
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.isConnected);
    };

    // Check connection status periodically
    const interval = setInterval(checkConnection, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    joinJob: socketService.joinJob.bind(socketService),
    leaveJob: socketService.leaveJob.bind(socketService),
    sendMessage: socketService.sendMessage.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
    setOnlineStatus: socketService.setOnlineStatus.bind(socketService),
    onNewMessage: socketService.onNewMessage.bind(socketService),
    onUserTyping: socketService.onUserTyping.bind(socketService),
    onJobUpdate: socketService.onJobUpdate.bind(socketService),
    onNotification: socketService.onNotification.bind(socketService),
    onProfessionalStatusChange: socketService.onProfessionalStatusChange.bind(socketService),
    off: socketService.off.bind(socketService),
  };
};

// Hook for real-time messaging
export const useRealtimeMessages = (jobId: string) => {
  const { user } = useAuth();
  const { isConnected, joinJob, leaveJob, onNewMessage, onUserTyping, off } = useSocket();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isConnected || !jobId) return;

    // Join job room
    joinJob(jobId);

    // Listen for new messages
    const handleNewMessage = (data: MessageData) => {
      setMessages(prev => [...prev, data]);
    };

    // Listen for typing indicators
    const handleUserTyping = (data: TypingData) => {
      if (data.userId === user?.id) return; // Don't show own typing

      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    onNewMessage(handleNewMessage);
    onUserTyping(handleUserTyping);

    // Cleanup
    return () => {
      leaveJob(jobId);
      off('new-message', handleNewMessage);
      off('user-typing', handleUserTyping);
    };
  }, [isConnected, jobId, user?.id, joinJob, leaveJob, onNewMessage, onUserTyping, off]);

  return {
    messages,
    typingUsers: Array.from(typingUsers),
    isConnected,
  };
};

// Hook for real-time notifications
export const useRealtimeNotifications = () => {
  const { onNotification, off } = useSocket();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    const handleNotification = (data: NotificationData) => {
      setNotifications(prev => [data, ...prev]);
    };

    onNotification(handleNotification);

    return () => {
      off('new-notification', handleNotification);
    };
  }, [onNotification, off]);

  return {
    notifications,
    addNotification: (notification: NotificationData) => {
      setNotifications(prev => [notification, ...prev]);
    },
    clearNotifications: () => {
      setNotifications([]);
    },
  };
};
