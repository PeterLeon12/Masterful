import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/utils/logger';

interface SocketService {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
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
  onNewMessage: (callback: (data: any) => void) => void;
  onUserTyping: (callback: (data: any) => void) => void;
  onJobUpdate: (callback: (data: any) => void) => void;
  onNotification: (callback: (data: any) => void) => void;
  onProfessionalStatusChange: (callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

class SocketServiceClass implements SocketService {
  socket: Socket | null = null;
  isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  async connect(): Promise<void> {
    try {
      if (this.socket?.connected) {
        logger.info('Socket already connected');
        return;
      }

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const serverUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      this.socket = io(serverUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket initialization failed'));
          return;
        }

        this.socket.on('connect', () => {
          logger.info('Socket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          logger.error('Socket connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          logger.warn('Socket disconnected:', reason);
          this.isConnected = false;
          
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            this.handleReconnect();
          }
        });
      });
    } catch (error) {
      logger.error('Failed to connect to socket:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      logger.info('Socket connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      logger.warn('Socket disconnected:', reason);
      this.isConnected = false;
    });

    // Error handling
    this.socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    logger.info(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          await this.connect();
        }
      } catch (error) {
        logger.error('Reconnection failed:', error);
      }
    }, delay);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      logger.info('Socket disconnected');
    }
  }

  joinJob(jobId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-job', jobId);
      logger.info(`Joined job room: ${jobId}`);
    }
  }

  leaveJob(jobId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-job', jobId);
      logger.info(`Left job room: ${jobId}`);
    }
  }

  sendMessage(data: {
    recipientId: string;
    message: string;
    jobId: string;
  }): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('private-message', data);
      logger.info('Message sent via socket:', data);
    } else {
      logger.warn('Socket not connected, cannot send message');
    }
  }

  startTyping(data: { recipientId: string; jobId: string }): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-start', data);
    }
  }

  stopTyping(data: { recipientId: string; jobId: string }): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing-stop', data);
    }
  }

  setOnlineStatus(status: boolean): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('set-online-status', status);
    }
  }

  // Event listeners
  onNewMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onUserTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onJobUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('job-updated', callback);
      this.socket.on('new-application', callback);
      this.socket.on('job-status-changed', callback);
    }
  }

  onNotification(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('new-notification', callback);
    }
  }

  onProfessionalStatusChange(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('professional-status-change', callback);
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }
}

// Create singleton instance
export const socketService = new SocketServiceClass();

// Export types
export interface MessageData {
  id: string;
  jobId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION';
  createdAt: string;
  sender?: {
    id: string;
    name: string;
  };
}

export interface TypingData {
  userId: string;
  jobId: string;
  isTyping: boolean;
}

export interface JobUpdateData {
  jobId: string;
  type: 'updated' | 'application' | 'status-changed';
  data: any;
}

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  createdAt: string;
}

export interface ProfessionalStatusData {
  userId: string;
  isOnline: boolean;
}
